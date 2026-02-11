# VisionPath — Full AI Handoff Document

> Complete codebase reference. Updated February 2026.

---

## What Is VisionPath?

VisionPath is an **AI-powered visual project planning tool**. Users describe a project idea through a guided onboarding flow, then AI (Gemini 2.0 Flash) builds a hierarchical plan as a **directed acyclic graph (DAG)** on an interactive canvas. Users can:

- Chat with AI to refine the plan
- Click nodes to inspect/edit them
- Attach PRDs and IDE prompts to nodes (copy-to-clipboard), or AI-generate them
- Upload images for mood boards
- Right-click to create nodes anywhere on canvas with smart parent suggestion
- Drag edges between nodes to set relationships
- Add typed dependency edges (`blocks`, `depends_on`) between any nodes
- Preview blast radius: see all downstream-affected nodes when one changes
- Export plans as JSON, Markdown, `.cursorrules`, `CLAUDE.md`, `plan.md`, `tasks.md`
- Import projects from JSON or Markdown specs
- Share plans via public read-only URL
- Start from pre-built templates (Auth System, CRUD API, Landing Page)

**In short:** Describe your idea → AI builds a visual plan → Refine with rich content → Generate PRDs & prompts → Export & share.

---

## Tech Stack (Actual, Installed)

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 15.5.12 |
| Language | TypeScript | 5.x |
| React | React | 19.0.0 |
| Canvas | @xyflow/react (React Flow) | 12.3.2 |
| Layout | dagre | 0.8.5 |
| State | Zustand | 5.0.2 |
| AI | @google/generative-ai (Gemini) | 0.21.0 |
| Database | Firebase Firestore | 12.9.0 |
| Styling | Tailwind CSS | 3.4.1 |
| Animation | Framer Motion | 11.x |
| Icons | Lucide React | 0.462.0 |
| Markdown | react-markdown | 9.0.1 |
| Utilities | clsx, tailwind-merge | latest |

### NOT Installed (Planned but not in package.json)
- d3-force (spring physics) — using dagre for layout instead
- yjs / y-partykit (real-time collaboration) — not yet needed
- chokidar (file watcher) — territory sync not implemented

---

## Environment Variables

```env
# Required
NEXT_PUBLIC_GEMINI_API_KEY=<Gemini API key>

# Optional (Firebase — app works without these, all guarded with null checks)
NEXT_PUBLIC_FIREBASE_API_KEY=<key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<project>.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<app-id>
```

**Note:** Firebase is fully optional. All Firebase services (`firebase.ts`, `firestore.ts`, `auth.ts`) are null-guarded — the app runs entirely in-memory without Firebase keys.

---

## Project Structure

```
Planner/
├── app/
│   ├── layout.tsx                    # Root layout (Inter font, Header, favicon metadata)
│   ├── page.tsx                      # Dashboard — ProjectList
│   ├── globals.css                   # CSS variables, node colors, React Flow overrides
│   ├── icon.svg                      # App icon
│   ├── project/
│   │   ├── new/page.tsx              # New project: Onboarding → Chat + Canvas
│   │   └── [id]/page.tsx             # Existing project: ProjectWorkspace
│   ├── login/page.tsx                # Auth page (Firebase)
│   └── api/ai/
│       ├── chat/route.ts             # POST - Gemini chat (progressive plan building)
│       ├── suggest-features/route.ts # POST - AI feature suggestions for onboarding
│       ├── generate-prd/route.ts     # POST - AI PRD generation from node context
│       ├── generate-prompt/route.ts  # POST - AI implementation prompt generation
│       └── generate-questions/route.ts # POST - AI question generation for nodes
├── components/
│   ├── canvas/
│   │   ├── graph-canvas.tsx          # React Flow canvas (blast radius, typed edges, onConnect)
│   │   ├── canvas-toolbar.tsx        # Export dropdown, blast radius toggle, undo/redo
│   │   ├── timeline-bar.tsx          # Goal progress circles
│   │   ├── nodes/
│   │   │   ├── base-plan-node.tsx    # Shared node (goal/subgoal/feature/task)
│   │   │   ├── goal-node.tsx         # Goal wrapper
│   │   │   ├── subgoal-node.tsx      # Subgoal wrapper
│   │   │   ├── feature-node.tsx      # Feature wrapper
│   │   │   ├── task-node.tsx         # Task wrapper
│   │   │   ├── moodboard-node.tsx    # Image grid node
│   │   │   ├── notes-node.tsx        # Rich text node
│   │   │   ├── connector-node.tsx    # Compact status waypoint
│   │   │   ├── node-toolbar.tsx      # Hover toolbar (edit, status, collapse, add child)
│   │   │   └── node-types.ts         # nodeTypes registry (7 types)
│   │   └── context-menu/
│   │       ├── node-context-menu.tsx  # Right-click node (+ dependency edge creation)
│   │       ├── pane-context-menu.tsx  # Right-click canvas (add node + smart mapping)
│   │       └── context-submenu.tsx    # Flyout submenu helper
│   ├── chat/
│   │   ├── planning-chat.tsx         # Chat panel with message list + Save
│   │   ├── chat-input.tsx            # Input with context chip
│   │   ├── chat-message.tsx          # Message bubble (markdown)
│   │   └── typing-indicator.tsx      # Loading dots
│   ├── dashboard/
│   │   ├── project-list.tsx          # Grid of project cards + import buttons
│   │   ├── project-card.tsx          # Card with node counts
│   │   ├── create-project-button.tsx # Link to /project/new
│   │   ├── import-project-button.tsx # JSON import button
│   │   ├── import-markdown-modal.tsx # Markdown import modal with preview
│   │   └── empty-state.tsx           # No projects state
│   ├── onboarding/
│   │   ├── project-onboarding.tsx    # Multi-step questionnaire (7 steps + summary)
│   │   ├── new-project-chooser.tsx   # 3-option entry: AI Chat / Template / Import
│   │   └── template-gallery.tsx      # Template cards with use button
│   ├── panels/
│   │   ├── node-detail-panel.tsx     # Full panel: edit, PRDs, prompts, images, AI generate
│   │   ├── node-edit-form.tsx        # Title + description inline edit
│   │   └── rich-text-editor.tsx      # Tiptap rich text editor
│   ├── share/
│   │   ├── share-button.tsx          # Share popover (public/private toggle, copy link)
│   │   └── shared-plan-view.tsx      # Read-only canvas for shared plans
│   ├── project/
│   │   └── project-workspace.tsx     # Canvas + chat + detail panel + share button
│   ├── layout/
│   │   ├── header.tsx                # Top nav bar
│   │   ├── theme-toggle.tsx          # Dark/light toggle
│   │   └── user-menu.tsx             # User avatar/menu
│   ├── error-boundary.tsx             # React error boundary component
│   └── ui/                           # Reusable primitives (button, card, badge, etc.)
├── hooks/
│   ├── use-ai-chat.ts               # Chat logic: send, init, context injection
│   ├── use-auto-layout.ts           # Dagre layout algorithm
│   └── use-project.ts               # Firestore load/save with debounce
├── stores/
│   ├── project-store.ts             # Central state: project, nodes, edges, PRDs, prompts
│   ├── chat-store.ts                # Chat messages, phase, onboarding answers
│   └── ui-store.ts                  # Theme, selected node, detail panel
├── services/
│   ├── firebase.ts                  # Firebase init (null-guarded)
│   ├── firestore.ts                 # CRUD (null-guarded)
│   ├── auth.ts                      # Auth functions (null-guarded)
│   ├── gemini.ts                    # Gemini client + response schemas (chat, PRD, prompt)
│   ├── persistence.ts               # Persistence abstraction layer
│   └── local-storage.ts             # localStorage fallback for offline persistence
├── prompts/
│   ├── planning-system.ts           # Main AI system prompt
│   ├── prd-generation.ts            # PRD generation system prompt
│   ├── prompt-generation.ts         # Implementation prompt generation system prompt
│   ├── question-generation.ts       # AI question generation system prompt
│   └── refinement-system.ts         # Refinement prompt (unused)
├── lib/
│   ├── constants.ts                 # NODE_CONFIG (7 types), NODE_CHILD_TYPE, DAGRE_CONFIG
│   ├── node-context.ts              # buildNodeContext() — hierarchy context for AI generation
│   ├── export-import.ts             # JSON export/import with download/read helpers
│   ├── export-markdown.ts           # Subtree + full plan markdown export
│   ├── export-project-files.ts      # .cursorrules, CLAUDE.md, plan.md, tasks.md generators
│   ├── import-markdown.ts           # Markdown spec parser (headings, checklists, frontmatter)
│   ├── blast-radius.ts              # Downstream impact analysis (getBlastRadius)
│   ├── templates/                   # Seed plan templates
│   │   ├── index.ts                 # Template registry (3 templates)
│   │   ├── auth-system.ts           # SaaS Authentication System (24 nodes)
│   │   ├── crud-api.ts              # REST API with CRUD (22 nodes)
│   │   └── landing-page.ts          # Marketing Landing Page (20 nodes)
│   ├── feature-suggestions.ts       # AI feature suggestion schema
│   ├── onboarding-config.ts         # Onboarding step definitions
│   ├── onboarding-message.ts        # Formats answers into AI prompt
│   ├── id.ts                        # generateId() — crypto.randomUUID
│   └── utils.ts                     # cn() — clsx + tailwind-merge
├── types/
│   ├── project.ts                   # PlanNode, ProjectEdge, EdgeType, Project
│   ├── canvas.ts                    # FlowNode, FlowEdge, PlanNodeData
│   └── chat.ts                      # ChatMessage, AIPlanNode
├── public/
│   └── favicon.svg                  # Browser favicon
└── contexts/
    └── auth-context.tsx             # Firebase auth context provider
```

---

## Data Model

### PlanNode (7 types)
```typescript
type NodeType = 'goal' | 'subgoal' | 'feature' | 'task' | 'moodboard' | 'notes' | 'connector'

interface PlanNode {
  id: string
  type: NodeType
  title: string
  description: string
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked'
  parentId: string | null
  collapsed: boolean
  questions: NodeQuestion[]
  content?: string          // Rich text (notes nodes)
  images?: string[]         // Base64 data URLs (moodboard nodes)
  prds?: NodePRD[]          // Attached PRD documents
  prompts?: NodePrompt[]    // Attached IDE prompts
}
```

### ProjectEdge (Typed Dependencies)
```typescript
type EdgeType = 'hierarchy' | 'blocks' | 'depends_on'

interface ProjectEdge {
  id: string
  source: string
  target: string
  edgeType?: EdgeType       // Visual style: red dashed (blocks), blue dashed (depends_on)
  label?: string
}
```

### Project
```typescript
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
  isPublic?: boolean        // Shareable plans
  shareId?: string          // Share URL identifier
}
```

### NodePRD / NodePrompt
```typescript
interface NodePRD {
  id: string
  title: string
  content: string           // Monospaced content, copyable to clipboard
  updatedAt: number
}

interface NodePrompt {
  id: string
  title: string
  content: string           // IDE prompt, one-click copy
  updatedAt: number
}
```

### Node Configuration (`lib/constants.ts`)
| Type | Color (CSS var) | Width | Height | Icon |
|------|-----------------|-------|--------|------|
| Goal | hsl(var(--node-goal)) | 280 | 120 | Target |
| Subgoal | hsl(var(--node-subgoal)) | 260 | 110 | Flag |
| Feature | hsl(var(--node-feature)) | 240 | 100 | Puzzle |
| Task | hsl(var(--node-task)) | 220 | 90 | CheckSquare |
| Moodboard | hsl(var(--node-moodboard)) | 300 | 250 | ImagePlus |
| Notes | hsl(var(--node-notes)) | 320 | 200 | FileText |
| Connector | hsl(var(--node-connector)) | 120 | 40 | Circle |

---

## Key Store Methods (`project-store.ts`)

**Project Lifecycle**: `setCurrentProject`, `setProjects`, `initDraftProject`, `ingestPlan`, `mergeNodes`, `addProject`, `removeProject`

**Node CRUD**: `addChildNode`, `addFreeNode`, `deleteNode`, `duplicateNode`, `changeNodeType`, `toggleNodeCollapse`, `updateNodeContent`, `updateNodeStatus`

**Questions**: `answerNodeQuestion`, `addNodeQuestions`, `addCustomNodeQuestion`

**Rich Content**: `updateNodeRichContent`, `addNodeImage`, `removeNodeImage`

**PRDs**: `addNodePRD`, `updateNodePRD`, `removeNodePRD`

**Prompts**: `addNodePrompt`, `updateNodePrompt`, `removeNodePrompt`

**Connections**: `connectNodes`, `addDependencyEdge`, `removeDependencyEdge`, `setNodeParent`

**Sharing**: `toggleShareProject`

**Flow State**: `setFlowNodes`, `setFlowEdges`

**Undo/Redo**: `undo`, `redo` (with `canUndo`, `canRedo` state)

**Flow Conversion**: `planNodesToFlow(nodes, projectEdges)` — converts PlanNode[] + ProjectEdge[] → FlowNode[] + FlowEdge[]

---

## Application Flows

### New Project
```
/project/new → NewProjectChooser (AI Chat / Template / Import)
  → AI Chat: Onboarding (7 steps) → AI suggests features → Summary → Start Planning
  → Template: TemplateGallery → choose template → ingestPlan() → /project/[id]
  → Import: ImportMarkdownModal → paste/upload markdown → create project
```

### Canvas Interactions
- **Click node** → Detail panel opens (edit, PRDs, prompts, images, children, AI generate)
- **Right-click node** → Context menu (edit, type, status, add child/sibling, duplicate, delete, add dependency edge)
- **Right-click empty canvas** → Pane context menu (add any node type, smart parent suggestion)
- **Drag source→target handle** → Creates edge (sets parentId, or typed dependency if pendingEdge)
- **Re-layout button** → Dagre auto-layout
- **Blast radius toggle** → Dims unaffected nodes when a node is selected
- **Export dropdown** → JSON, Markdown, .cursorrules, CLAUDE.md, plan.md, tasks.md
- **Share button** → Public/private toggle with shareable URL

### Smart Mapping
When right-clicking empty canvas, the pane context menu shows an arrow (→) button next to node types that have a valid parent nearby. Hierarchy rules:
- subgoal → goal
- feature → subgoal, goal
- task → feature, subgoal

The nearest valid parent is found by Euclidean distance between flow positions.

---

## Key Patterns

1. **All shared state in Zustand** — component-local state only for UI
2. **`planNodesToFlow(nodes, edges)`** — always called after node mutations to sync React Flow (hierarchy + typed edges)
3. **Dagre for layout** — `useAutoLayout` hook, TB direction, triggered on node count change
4. **AI responses are structured JSON** — Gemini uses `responseSchema` for typed output
5. **AI generation uses full context** — `buildNodeContext()` gathers parent chain, Q&A, siblings, children
6. **Merge by ID** — `mergeNodes()` upserts; same ID = update, new ID = add
7. **Firebase null-guarded** — all services return early if Firebase not initialized
8. **Images as base64** — stored directly in PlanNode, no external storage needed
9. **Typed edges** — `blocks` (red dashed, animated) and `depends_on` (blue dashed) with labels
10. **Blast radius** — `getBlastRadius()` recursively traverses hierarchy + dependency edges
11. **Multi-format export** — JSON, AI-optimized Markdown, Spec Kit files (.cursorrules, CLAUDE.md)
12. **Markdown import** — heading levels map to node types (# → goal, ## → subgoal, ### → feature, #### → task)

---

## Known Issues

1. **localStorage persistence fallback** — state persists via localStorage when Firebase is not configured
2. **SWC warning on build** — pre-existing Windows environment issue, not code-related
3. **`changeNodeType` has no hierarchy validation** — user can change a goal to a task
4. **No auth enforcement** — app works without Firebase auth
5. **`refinement-system.ts` is unused** — only `planning-system.ts` is active
6. **Base64 images can bloat state** — no size limits or compression currently

---

## Commands

```bash
npm run dev       # Start dev server (port 3000)
npm run build     # Production build
npx tsc --noEmit  # TypeScript check
npm run lint      # ESLint
```

---

## Deployment

**GitHub**: `https://github.com/benauyoung/Planner.git`

**Vercel**: Import from GitHub, add `NEXT_PUBLIC_GEMINI_API_KEY` env var, deploy.

---

## How to Continue Development

1. Read `PLAN.md` for current status and future work items
2. Read `ARCHITECTURE.md` for data models and component structure
3. Check `types/project.ts` for the canonical data model
4. Check `stores/project-store.ts` for all available mutations
5. The next big features are: **real-time collaboration** (Yjs), **territory file sync**, and **production polish** (v0.5.0 Beta is complete)
