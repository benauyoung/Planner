# TinyBaguette Architecture

> Source of truth for how TinyBaguette is built. Reflects the **actual implemented codebase** as of February 22, 2026.

---

## System Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        Browser (Client)                       │
├──────────────┬───────────────┬───────────────┬───────────────┤
│  React Flow  │    Zustand    │  Framer Motion│  Gemini API   │
│  (Canvas)    │    (State)    │  (Animation)  │  (AI Chat)    │
├──────────────┴───────┬───────┴───────────────┴───────────────┤
│                      │                                        │
│  ┌───────────────────▼──────────────────┐                    │
│  │         Dagre Auto-Layout            │                    │
│  │  (Top-to-bottom hierarchical layout) │                    │
│  └──────────────────────────────────────┘                    │
├──────────────────────────────────────────────────────────────┤
│                    Next.js App Router                         │
│  Route Groups: (marketing) public │ (app) authenticated      │
│              API Routes: /api/ai/chat                         │
│              API Routes: /api/ai/suggest-features             │
│              API Routes: /api/ai/generate-prd                 │
│              API Routes: /api/ai/generate-prompt              │
│              API Routes: /api/ai/generate-questions           │
│              API Routes: /api/ai/iterate                      │
│              API Routes: /api/ai/analyze                      │
│              API Routes: /api/ai/generate-pages               │
│              API Routes: /api/ai/edit-page                    │
│              API Routes: /api/ai/refine                       │
│              API Routes: /api/ai/generate-backend             │
│              API Routes: /api/ai/edit-backend                 │
│              API Routes: /api/ai/generate-app                 │
│              API Routes: /api/ai/edit-app                     │
│              API Routes: /api/ai/generate-followups           │
│              API Routes: /api/agent/generate                  │
│              API Routes: /api/agent/[agentId]/chat            │
│              API Routes: /api/waitlist                        │
├──────────────────────────────────────────────────────────────┤
│         Firebase (Optional, guarded, runtime failover)        │
│              Auth + Firestore → localStorage fallback         │
└──────────────────────────────────────────────────────────────┘
```

---

## Actual Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | Next.js | 15.5.12 | App Router, API routes |
| Language | TypeScript | 5.x | Type safety |
| React | React | 19.0.0 | UI rendering |
| Canvas | @xyflow/react | 12.3.2 | Infinite canvas, node/edge rendering |
| Layout | dagre | 0.8.5 | Hierarchical auto-layout |
| State | Zustand | 5.0.2 | Client-side reactive state |
| AI | @google/generative-ai | 0.21.0 | Gemini 2.0 Flash |
| Database | Firebase Firestore | 12.9.0 | Optional persistence (guarded) |
| Styling | Tailwind CSS | 3.4.1 | Utility-first CSS |
| Icons | Lucide React | 0.462.0 | Icon library |
| Animation | Framer Motion | 11.x | Transitions, context menus |
| Markdown | react-markdown | 9.0.1 | Rendering markdown in chat |

### Installed but No Longer Used by Active Code
- `@webcontainer/api` — Was used by Design tab (Phase 13), replaced by srcdoc iframes in Phase 16
- `@monaco-editor/react` — Was used by Design tab code editor, no longer used
- `jszip` — Was used by Design tab zip export, no longer used

### Not Installed (Referenced in older docs but NOT in package.json)
- d3-force (spring physics) — custom engine in `lib/canvas-physics.ts` instead
- yjs / y-partykit (real-time collaboration) — client infrastructure ready, no WebSocket backend yet
- partykit (WebSocket) — collaboration provider ready to connect

---

## Data Models (Actual — from `types/project.ts`)

```typescript
type NodeType =
  | 'goal' | 'subgoal' | 'feature' | 'task'
  | 'moodboard' | 'notes' | 'connector'
  | 'spec' | 'prd' | 'schema' | 'prompt' | 'reference'

type NodeStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked'

interface NodeQuestion {
  id: string
  question: string
  answer: string
  options?: string[]
  isCustom?: boolean
  category?: string           // e.g. "Technical Approach", "Data Model"
  isFollowUp?: boolean        // true if AI generated based on prior answers
  followUpForId?: string      // id of the question that triggered this follow-up
}

interface NodePRD {
  id: string
  title: string
  content: string
  updatedAt: number
  referencedPrdIds?: string[]   // Cross-references: compound key "nodeId:prdId"
  isStale?: boolean             // True when answers changed after generation
  staleReason?: string          // Human-readable reason for staleness
}

interface NodePrompt {
  id: string
  title: string
  content: string
  updatedAt: number
}

type Priority = 'critical' | 'high' | 'medium' | 'low' | 'none'

interface PlanNode {
  id: string
  type: NodeType
  title: string
  description: string
  status: NodeStatus
  parentId: string | null
  collapsed: boolean
  questions: NodeQuestion[]
  content?: string        // Rich text (notes nodes)
  images?: string[]       // Base64 data URLs (moodboard nodes)
  prds?: NodePRD[]
  prompts?: NodePrompt[]
  assigneeId?: string     // Team member ID
  priority?: Priority
  dueDate?: number
  estimatedHours?: number
  tags?: string[]
  comments?: NodeComment[]
  sprintId?: string
  document?: NodeDocument // Notion-style block document
  // Document node fields (spec, prd, schema, prompt, reference)
  version?: string
  schemaType?: 'data_model' | 'api_contract' | 'database' | 'other'
  promptType?: 'implementation' | 'refactor' | 'test' | 'review'
  targetTool?: 'cursor' | 'windsurf' | 'claude' | 'generic'
  referenceType?: 'link' | 'file' | 'image'
  url?: string
  acceptanceCriteria?: string[]
}

type EdgeType =
  | 'hierarchy' | 'blocks' | 'depends_on'
  | 'informs' | 'defines' | 'implements' | 'references' | 'supersedes'

interface ProjectEdge {
  id: string
  source: string
  target: string
  edgeType?: EdgeType
  label?: string
}

interface Project {
  id: string
  userId: string
  title: string
  description: string
  phase: 'planning' | 'active'
  nodes: PlanNode[]
  edges: ProjectEdge[]
  createdAt: number
  updatedAt: number
  isPublic?: boolean
  shareId?: string
  team?: TeamMember[]
  activity?: ActivityEvent[]
  sprints?: Sprint[]
  versions?: ProjectVersion[]
  currentVersionId?: string
  pages?: ProjectPage[]       // AI-generated page previews
  pageEdges?: PageEdge[]      // Navigation flow between pages
  backendModules?: BackendModule[]  // AI-generated backend architecture modules
  backendEdges?: BackendEdge[]      // Connections between backend modules
  agents?: Agent[]             // Embeddable AI chatbot agents
}

interface ProjectPage {
  id: string
  title: string
  route: string
  html: string
  linkedNodeIds: string[]
  position: { x: number; y: number }
}

interface PageEdge {
  id: string
  source: string
  target: string
  label?: string
}

type BackendModuleType = 'endpoint' | 'model' | 'service' | 'middleware' | 'database' | 'auth' | 'config'
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface BackendModule {
  id: string
  type: BackendModuleType
  title: string
  description: string
  code: string
  linkedNodeIds: string[]
  position: { x: number; y: number }
  method?: HttpMethod
  path?: string
  fields?: { name: string; type: string; required: boolean }[]
}

interface BackendEdge {
  id: string
  source: string
  target: string
  label?: string
  edgeType?: 'uses' | 'returns' | 'stores' | 'middleware' | 'depends_on'
}

// Supporting types
interface TeamMember { id, name, email, avatar?, color }
interface NodeComment { id, authorId, authorName, authorColor, content, createdAt }
interface ActivityEvent { id, type, nodeId, nodeTitle, actorName, detail, timestamp }
interface Sprint { id, name, startDate, endDate, nodeIds, status }
interface ProjectVersion { id, name, snapshot, parentVersionId?, createdAt }
type DocumentBlock = heading | paragraph | code | checklist | divider | callout
interface NodeDocument { id, blocks: DocumentBlock[], updatedAt }
```

### Canvas Types (from `types/canvas.ts`)

```typescript
interface PlanNodeData {
  label: string
  description: string
  nodeType: NodeType
  status: NodeStatus
  collapsed: boolean
  parentId: string | null
  questionsTotal: number
  questionsAnswered: number
  content?: string
  images?: string[]
  prds?: NodePRD[]
  prompts?: NodePrompt[]
  version?: string
  schemaType?: string
  promptType?: string
  targetTool?: string
  referenceType?: string
  url?: string
  acceptanceCriteria?: string[]
  [key: string]: unknown
}

type FlowNode = Node<PlanNodeData>
type FlowEdge = Edge
```

---

## State Management (Zustand)

### Three Stores

| Store | File | Purpose |
|-------|------|---------|
| `useProjectStore` | `stores/project-store.ts` | Project data, nodes, edges, flow state |
| `useChatStore` | `stores/chat-store.ts` | AI chat message history |
| `useUIStore` | `stores/ui-store.ts` | Selected node, panel state, blast radius, edge creation, PRD pipeline toggle |

### Key ProjectStore Methods

```typescript
interface ProjectState {
  currentProject: Project | null
  projects: Project[]
  flowNodes: FlowNode[]
  flowEdges: FlowEdge[]
  _undoStack: Project[]
  _redoStack: Project[]
  canUndo: boolean
  canRedo: boolean

  // Project lifecycle
  setCurrentProject: (project: Project | null) => void
  setProjects: (projects: Project[]) => void
  setFlowNodes: (nodes: FlowNode[]) => void
  setFlowEdges: (edges: FlowEdge[]) => void
  initDraftProject: (userId: string) => void
  ingestPlan: (plan, userId) => Project
  mergeNodes: (newNodes: AIPlanNode[], suggestedTitle?) => void
  addProject: (project: Project) => void
  removeProject: (projectId: string) => void

  // Node CRUD
  updateNodeStatus: (nodeId, status) => void
  updateNodeContent: (nodeId, title, description) => void
  toggleNodeCollapse: (nodeId) => void
  deleteNode: (nodeId) => void
  addChildNode: (parentId, title) => string | null
  duplicateNode: (nodeId, includeChildren) => string | null
  changeNodeType: (nodeId, newType) => void
  addFreeNode: (type, title, parentId?) => string

  // Questions
  answerNodeQuestion: (nodeId, questionId, answer) => void
  addNodeQuestions: (nodeId, questions) => void
  addCustomNodeQuestion: (nodeId, question) => void

  // Rich content
  updateNodeRichContent: (nodeId, content) => void
  addNodeImage: (nodeId, imageUrl) => void
  removeNodeImage: (nodeId, imageUrl) => void

  // PRDs & Prompts
  addNodePRD: (nodeId, title, content) => string | null
  updateNodePRD: (nodeId, prdId, title, content) => void
  removeNodePRD: (nodeId, prdId) => void
  addNodePrompt: (nodeId, title, content) => string | null
  updateNodePrompt: (nodeId, promptId, title, content) => void
  removeNodePrompt: (nodeId, promptId) => void

  // Connections
  connectNodes: (sourceId, targetId) => void
  addDependencyEdge: (sourceId, targetId, edgeType) => void
  removeDependencyEdge: (edgeId) => void
  setNodeParent: (nodeId, parentId) => void

  // Assignees & Metadata
  setNodeAssignee, setNodePriority, setNodeDueDate, setNodeEstimate, setNodeTags

  // Team
  addTeamMember, removeTeamMember

  // Comments & Activity
  addNodeComment, deleteNodeComment, addActivityEvent

  // Sprints
  createSprint, updateSprint, deleteSprint, assignNodeToSprint

  // Versions
  saveVersion, restoreVersion, deleteVersion

  // Documents
  updateNodeDocument
  updateNodeVersion, updateNodeSchemaType, updateNodePromptType
  updateNodeTargetTool, updateNodeReferenceType, updateNodeUrl
  updateNodeAcceptanceCriteria

  // Project
  updateProjectTitle

  // Pages
  setPages, updatePageHtml, updatePagePosition
  addPageEdge, removePageEdge, removePage

  // Backend
  setBackendModules, updateBackendModule, updateBackendModulePosition
  removeBackendModule, addBackendEdge, removeBackendEdge

  // Agents
  addAgent, updateAgent, removeAgent
  addAgentKnowledge, removeAgentKnowledge
  addAgentRule, removeAgentRule
  updateAgentTheme, toggleAgentPublished

  // Sharing
  toggleShareProject: () => string | null

  // Undo/Redo
  undo: () => void
  redo: () => void
}
```

### planNodesToFlow Conversion

The `planNodesToFlow(nodes, projectEdges, existingFlowNodes?)` function converts `PlanNode[]` + `ProjectEdge[]` → `{ FlowNode[], FlowEdge[] }`:
- Filters out children of collapsed nodes
- Preserves existing node positions when `existingFlowNodes` is provided
- Generates hierarchy edges from `parentId` relationships
- Generates typed dependency edges from `project.edges[]` with visual styles (red dashed for `blocks`, blue dashed for `depends_on`, plus styles for `informs`, `defines`, `implements`, `references`, `supersedes`)
- Passes all data (content, images, prds, prompts, document node fields) to flow node data

---

## Component Architecture (Actual)

```
components/
├── landing/                            # Public landing page (marketing, 10 components)
│   ├── nav-bar.tsx                     # Sticky nav, blur on scroll, mobile menu
│   ├── hero-prompt.tsx                 # AI prompt → page preview generator with email capture
│   ├── hero-mockup.tsx                 # SVG animated canvas mockup (nodes + edges)
│   ├── features-tabs.tsx               # Interactive 4-tab demo: Planning, Design, Agents, Integrations
│   ├── interactive-showcase.tsx        # Animated canvas, task table, Gantt demos
│   ├── trust-bar.tsx                   # Social proof badges
│   ├── how-it-works.tsx                # 3-step workflow
│   ├── features-grid.tsx               # 6-card feature showcase
│   ├── cta-banner.tsx                  # Full-width gradient CTA
│   └── footer.tsx                      # 4-column footer with social icons
├── canvas/
│   ├── graph-canvas.tsx              # Main ReactFlow wrapper (blast radius, typed edges)
│   ├── canvas-toolbar.tsx            # Export dropdown, blast radius toggle, undo/redo
│   ├── context-menu/
│   │   ├── node-context-menu.tsx     # Right-click on node (+ dependency edge actions)
│   │   ├── pane-context-menu.tsx     # Right-click on empty canvas (smart mapping)
│   │   └── context-submenu.tsx       # Submenu helper
│   └── nodes/
│       ├── node-types.ts             # nodeTypes registry (12 types)
│       ├── base-plan-node.tsx        # Shared node layout (goal/subgoal/feature/task)
│       ├── goal-node.tsx             # Goal wrapper
│       ├── subgoal-node.tsx          # Subgoal wrapper
│       ├── feature-node.tsx          # Feature wrapper
│       ├── task-node.tsx             # Task wrapper
│       ├── moodboard-node.tsx        # Image grid node
│       ├── notes-node.tsx            # Rich text node
│       ├── connector-node.tsx        # Compact status waypoint
│       ├── spec-node.tsx             # Specification document node
│       ├── prd-node.tsx              # PRD document node
│       ├── schema-node.tsx           # Data model / API contract node
│       ├── prompt-node.tsx           # AI/IDE prompt template node
│       ├── reference-node.tsx        # External link / file reference node
│       └── node-toolbar.tsx          # Hover toolbar (edit, status, collapse, add child)
├── chat/
│   ├── planning-chat.tsx             # AI chat panel
│   ├── chat-input.tsx                # Message input
│   ├── chat-message.tsx              # Message bubble
│   └── typing-indicator.tsx          # AI typing dots
├── views/                             # View tabs: Plan, Design, Agents, Manage (with sub-views)
│   ├── list-view.tsx                  # Manage sub-view: hierarchical tree with expand/collapse
│   ├── table-view.tsx                 # Manage sub-view: sortable/filterable grid
│   ├── board-view.tsx                 # Manage sub-view: Kanban by status with drag-and-drop
│   ├── timeline-view.tsx              # Manage sub-view: interactive Gantt chart with drag-to-move/resize
│   ├── backend-view.tsx               # Manage sub-view: backend module architect on zoomable canvas
│   ├── design-view.tsx                # Design tab: srcdoc iframe previews, AI page generation, PageChat sidebar, single/canvas modes, agent drop handler
│   ├── design-canvas.tsx              # React Flow canvas for Design tab: PageFrameNode (srcdoc iframes), AgentsPanel (drag-and-drop), inline AI edit bar
│   ├── pages-view.tsx                 # Legacy: AI-generated page previews on canvas (unused)
│   └── agents-view.tsx                # Agents view: agent builder with config, knowledge, theme, preview, deploy tabs
├── sprints/
│   └── sprint-board.tsx               # Sprint overview: create, drag backlog, progress bars
├── ai/
│   ├── ai-suggestions-panel.tsx       # AI iteration accept/dismiss
│   └── smart-suggestions-panel.tsx    # Ambient AI analysis panel
├── comments/
│   └── comment-thread.tsx             # Comment thread with add/delete
├── editor/
│   └── block-editor.tsx               # Notion-style block editor
├── versions/
│   └── version-history.tsx            # Save/restore/delete version snapshots
├── integrations/
│   └── integration-settings.tsx       # GitHub/Slack/Linear connect/disconnect
├── panels/
│   ├── node-detail-panel.tsx          # Detail panel: edit, questions (category/follow-up), PRDs (stale), prompts, images, children
│   ├── prd-pipeline-panel.tsx         # PRD Pipeline: status tabs, per-node status badges, Ralphy ZIP export
│   ├── node-edit-form.tsx             # Title/description edit form
│   └── rich-text-editor.tsx           # Tiptap rich text editor
├── project/
│   ├── project-workspace.tsx          # Canvas + views + chat + panels + modals
│   ├── project-toolbar.tsx            # Unified toolbar: back, title, save status, view tabs, actions
│   └── team-manager.tsx               # Modal to add/remove team members
├── onboarding/
│   ├── project-onboarding.tsx        # Multi-step questionnaire (7 steps + summary)
│   ├── new-project-chooser.tsx       # 3-option entry: AI Chat / Template / Import
│   └── template-gallery.tsx          # Template cards with use button
├── dashboard/
│   ├── project-list.tsx              # Project cards grid
│   ├── project-card.tsx              # Single project card
│   ├── dashboard-loader.tsx          # Animated loading screen (floating nodes, compass)
│   ├── create-project-button.tsx     # New project button
│   ├── import-project-button.tsx     # JSON import button
│   ├── import-markdown-modal.tsx     # Markdown import modal with preview
│   └── empty-state.tsx               # No projects state
├── share/
│   ├── share-button.tsx              # Share popover (public/private toggle, copy link)
│   └── shared-plan-view.tsx          # Read-only canvas for shared plans
├── layout/
│   ├── header.tsx                    # App header (logo → /dashboard)
│   ├── theme-toggle.tsx              # Dark/light toggle
│   └── user-menu.tsx                 # User avatar/menu
└── ui/                               # Reusable primitives
    ├── command-palette.tsx            # Cmd+K fuzzy search command palette
    ├── shortcuts-help.tsx             # Keyboard shortcut help overlay
    ├── priority-badge.tsx             # Priority badge + selector
    ├── assignee-picker.tsx            # Assignee dropdown with avatars
    ├── tag-input.tsx                  # Tag chips with add/remove
    └── (button, card, badge, skeleton, etc.)
```

---

## Key Flows

### 0. Landing → Login → Dashboard
```
User → / (public landing page)
  → Clicks "Get Started" → /login
  → Signs in (email/password or Google)
  → Redirect to /dashboard → DashboardLoader → ProjectList
```

### 1. Project Creation
```
User → /project/new → Onboarding questionnaire (7 steps)
  → AI suggests features → User confirms
  → ingestPlan() → creates Project with nodes
  → Redirect to /project/[id] → Canvas renders
```

### 2. AI Chat Planning
```
User types message → POST /api/ai/chat
  → Gemini processes with system prompt + project context
  → Returns structured JSON with new nodes
  → mergeNodes() adds to project → Canvas updates
```

### 3. Node Connection (Manual)
```
User drags from source handle → drops on target handle
  → onConnect callback → connectNodes(source, target)
  → Sets target.parentId = source → Re-runs planNodesToFlow
  → Edge appears on canvas
```

### 4. AI PRD/Prompt Generation
```
User clicks "Generate" on feature/subgoal node → detail panel
  → buildNodeContext() gathers full hierarchy (parent chain, Q&A, siblings, children)
  → POST /api/ai/generate-prd or /api/ai/generate-prompt
  → Gemini generates structured {title, content} JSON
  → addNodePRD() / addNodePrompt() adds to node → appears in list
```

### 5. Smart Mapping (Pane Context Menu)
```
User right-clicks empty canvas → PaneContextMenu appears
  → Shows node types with → arrow for auto-connect
  → suggestParent() finds nearest valid parent by hierarchy + distance
  → addFreeNode(type, title, parentId) → Node placed at click position
```

### 6. Dependency Edge Creation
```
User right-clicks node → "Add Blocks Edge" or "Add Depends On Edge"
  → startEdgeCreation(sourceId, edgeType) sets pendingEdge in UIStore
  → User drags to target node → onConnect checks for pendingEdge
  → addDependencyEdge(source, target, edgeType) → Typed edge appears
```

### 7. Blast Radius Preview
```
User clicks Radar icon in toolbar → blastRadiusMode = true
  → Select a node → getBlastRadius() traverses children + dependency edges
  → Unaffected nodes dimmed to 0.25 opacity, affected nodes stay at full opacity
```

### 8. Export Flow
```
User clicks Export dropdown in toolbar → chooses format
  → JSON: exportProjectAsJSON() → downloadFile()
  → Markdown: exportFullPlanAsMarkdown() → downloadFile()
  → Project files: generateCursorRules() / generateClaudeMD() etc.
  → Clipboard: navigator.clipboard.writeText()
```

### 9. Share Flow
```
User clicks Share button → popover with public/private toggle
  → toggleShareProject() sets isPublic + shareId on project
  → Copy link: /share/[shareId] → Read-only SharedPlanView
```

### 10. Template Flow
```
User clicks "Create New" → NewProjectChooser (3 options)
  → "Start from Template" → TemplateGallery shows 3 templates
  → Click template → ingestPlan() creates project → redirect to /project/[id]
```

---

## Node Configuration (from `lib/constants.ts`)

```typescript
// Each entry also has bgClass, borderClass, textClass, badgeClass, icon
const NODE_CONFIG = {
  goal:      { label: 'Goal',          color: 'hsl(var(--node-goal))',      icon: 'Target',       width: 280, height: 120 },
  subgoal:   { label: 'Subgoal',       color: 'hsl(var(--node-subgoal))',   icon: 'Flag',         width: 260, height: 110 },
  feature:   { label: 'Feature',       color: 'hsl(var(--node-feature))',   icon: 'Puzzle',       width: 240, height: 100 },
  task:      { label: 'Task',          color: 'hsl(var(--node-task))',      icon: 'CheckSquare',  width: 220, height: 90  },
  moodboard: { label: 'Mood Board',    color: 'hsl(var(--node-moodboard))', icon: 'ImagePlus',   width: 300, height: 250 },
  notes:     { label: 'Notes',         color: 'hsl(var(--node-notes))',     icon: 'FileText',    width: 320, height: 200 },
  connector: { label: 'Connector',     color: 'hsl(var(--node-connector))', icon: 'Circle',      width: 120, height: 40  },
  spec:      { label: 'Specification', color: 'hsl(var(--node-spec))',      icon: 'ScrollText',  width: 300, height: 140 },
  prd:       { label: 'PRD',           color: 'hsl(var(--node-prd))',       icon: 'ClipboardList',width: 280, height: 130 },
  schema:    { label: 'Schema',        color: 'hsl(var(--node-schema))',    icon: 'Braces',      width: 260, height: 120 },
  prompt:    { label: 'Prompt',        color: 'hsl(var(--node-prompt))',    icon: 'Terminal',    width: 240, height: 110 },
  reference: { label: 'Reference',     color: 'hsl(var(--node-reference))', icon: 'ExternalLink',width: 200, height: 80  },
}
```

---

## Firebase & Persistence (Optional, Guarded, Failover)

All Firebase usage is null-guarded so the app works without credentials:
- `services/firebase.ts` — Initializes only if env vars present
- `services/firestore.ts` — Returns early if `db` is null
- `services/auth.ts` — Returns early if `auth` is null
- `services/persistence.ts` — Persistence abstraction with runtime failover
- `services/local-storage.ts` — localStorage fallback for offline persistence

**Three persistence scenarios:**
1. Firebase not configured (no env vars) → uses localStorage from the start
2. Firebase configured and working → uses Firestore
3. Firebase configured but unavailable (e.g. database not provisioned) → tries Firestore, catches error, permanently falls back to localStorage

The `withFallback()` wrapper in `persistence.ts` handles scenario 3 automatically. Without Firebase or localStorage, Zustand state resets on refresh.

---

## Security

1. **API Keys**: Stored in `.env.local`, never committed (`.gitignore`)
2. **Firebase guarded**: App doesn't crash without Firebase keys
3. **Minimal `dangerouslySetInnerHTML`**: Only used for Tiptap-rendered HTML in `notes-node.tsx`; all other content rendered through React components
4. **Gemini key**: `NEXT_PUBLIC_` prefix means client-exposed — acceptable for this use case

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-01 | React Flow over D3.js | Built-in interactions, better React integration |
| 2025-01 | Zustand over Redux | Simpler API, sufficient for project scale |
| 2025-01 | Dagre over d3-force | Deterministic hierarchy layout vs physics jitter |
| 2026-02 | 12 node types | 7 base + 5 document types (spec, prd, schema, prompt, reference) |
| 2026-02 | PRDs + Prompts on nodes | Users need to attach IDE-ready content to plan nodes |
| 2026-02 | Smart mapping | Auto-suggest parent by hierarchy rules + proximity |
| 2026-02 | Firebase guarded | App must work without database for local dev |
| 2026-02 | AI PRD/prompt generation | One-click generation using full hierarchy context via Gemini |
| 2026-02 | Typed edges | blocks/depends_on edges for dependency tracking between non-parent nodes |
| 2026-02 | Blast radius | Visual downstream impact analysis when node is selected |
| 2026-02 | Export system | Multi-format export: JSON, Markdown, .cursorrules, CLAUDE.md |
| 2026-02 | Markdown import | Parse structured markdown into plan DAG with heading hierarchy |
| 2026-02 | Shareable plans | Public toggle with read-only share URL |
| 2026-02 | Template library | Pre-built seed plans for common project patterns |
| 2026-02 | Landing page | Public marketing page with hero, trust bar, features, CTA, footer |
| 2026-02 | Route groups | (marketing) for public pages, (app) for authenticated pages |
| 2026-02 | Persistence failover | Runtime Firestore → localStorage fallback on error |
| 2026-02 | Dashboard loader | Animated loading screen with floating nodes + spinning compass |
| 2026-02 | Command palette | Cmd+K fuzzy search + keyboard shortcuts for power users |
| 2026-02 | Multiple views | 4 view tabs (Plan, Design, Agents, Manage) with 6 Manage sub-views |
| 2026-02 | Team features | Assignees, priority, due dates, comments, activity feed |
| 2026-02 | AI iteration | Break down, audit, estimate, suggest deps — accept/dismiss |
| 2026-02 | Sprint planning | Create sprints, drag backlog, progress bars |
| 2026-02 | AI smart suggestions | Ambient analysis with severity-ranked insights |
| 2026-02 | Version history | Save/restore/delete named project snapshots |
| 2026-02 | Embedded docs | Notion-style block editor for node documents |
| 2026-02 | Collaboration | Pluggable provider, presence avatars, live cursors |
| 2026-02 | Integrations | GitHub, Slack, Linear service clients + settings UI |
| 2026-02 | 8 edge types | hierarchy + 7 dependency types for rich relationship modeling |
| 2026-02 | Unified toolbar | Single bar: back, title, save status, view tabs, action icons |
| 2026-02 | Interactive Gantt | Drag-to-move bars, edge-resize durations, snap-to-day |
| 2026-02 | Pages View | AI-generated Tailwind page previews on zoomable canvas (legacy, superseded by Design tab) |
| 2026-02 | Inline page chat | Click page, describe changes, AI regenerates HTML |
| 2026-02 | WebContainer Design tab | Live Vite+React app in-browser; replaces static previews (later replaced by srcdoc iframes) |
| 2026-02 | srcdoc iframe Design tab | Replaced WebContainer — standalone HTML + Tailwind CDN in srcdoc iframes, no SharedArrayBuffer needed |
| 2026-02 | Agent drag-and-drop | Drag agents from panel onto Design canvas pages to inject chat widget HTML |
| 2026-02 | Canvas page interactions | Inline AI editing, delete, focus, select-to-chat on Design canvas page nodes |
| 2026-02 | Multi-select + bulk actions | Rubber-band, Shift+click, Ctrl+A; BulkActionsBar with align/distribute/status |
| 2026-02 | Spring physics layout | Custom force-directed engine in canvas-physics.ts; Dagre/Spring toggle |
| 2026-02 | Level-of-detail zoom | 3 LOD tiers (full/compact/dot) based on viewport zoom level |
| 2026-02 | Territory file sync | Bidirectional canvas ↔ Markdown with diff review and selective merge |
| 2026-02 | Canvas layout TB | Switched dagre from left-to-right to top-to-bottom, fixed node overlap |
| 2026-02 | Deep question flow | Category-aware questions, multi-turn follow-ups, readiness badge |
| 2026-02 | PRD status tracking | 6 statuses per node; stale detection when answers change |
| 2026-02 | PRD Pipeline panel | Filter tabs, per-node status badges, Ralphy ZIP export |
| 2026-02 | Ralphy export format | ZIP: prd/*.md + .ralphy/config.yaml + PRD.md for autonomous coding |
| 2026-02 | Email waitlist | Hero prompt email capture → Firestore waitlist + optional Resend welcome |
| 2026-02 | API auth middleware | middleware.ts enforces Authorization header on /api/* when Firebase configured |
| 2026-02 | Panel simplification | Node detail panel stripped to essentials: edit, questions, PRDs, prompts |
