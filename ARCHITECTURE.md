# VisionPath Architecture

> Source of truth for how VisionPath is built. Reflects the **actual implemented codebase** as of February 2026.

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
│  │    (Hierarchical node positioning)   │                    │
│  └──────────────────────────────────────┘                    │
├──────────────────────────────────────────────────────────────┤
│                    Next.js App Router                         │
│              API Routes: /api/ai/chat                         │
│              API Routes: /api/ai/suggest-features             │
│              API Routes: /api/ai/generate-prd                 │
│              API Routes: /api/ai/generate-prompt              │
├──────────────────────────────────────────────────────────────┤
│              Firebase (Optional, guarded)                     │
│              Auth + Firestore                                 │
└──────────────────────────────────────────────────────────────┘
```

---

## Actual Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | Next.js | 15.1.3 | App Router, API routes |
| Language | TypeScript | 5.x | Type safety |
| React | React | 19.0.0 | UI rendering |
| Canvas | @xyflow/react | 12.3.2 | Infinite canvas, node/edge rendering |
| Layout | dagre | 0.8.5 | Hierarchical auto-layout |
| State | Zustand | 5.0.2 | Client-side reactive state |
| AI | @google/generative-ai | 0.21.0 | Gemini 2.0 Flash |
| Database | Firebase Firestore | 12.8.0 | Optional persistence (guarded) |
| Styling | Tailwind CSS | 3.4.1 | Utility-first CSS |
| Icons | Lucide React | 0.462.0 | Icon library |
| Animation | Framer Motion | 11.x | Transitions, context menus |
| Markdown | react-markdown | 9.0.1 | Rendering markdown in chat |

### Not Installed (Referenced in older docs but NOT in package.json)
- d3-force (spring physics) — using dagre for layout instead
- yjs / y-partykit (real-time collaboration) — not yet needed
- chokidar (file watcher) — territory sync not implemented
- partykit (WebSocket) — no real-time collab yet

---

## Data Models (Actual — from `types/project.ts`)

```typescript
type NodeType = 'goal' | 'subgoal' | 'feature' | 'task' | 'moodboard' | 'notes' | 'connector'

type NodeStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked'

interface NodeQuestion {
  id: string
  question: string
  answer: string
}

interface NodePRD {
  id: string
  title: string
  content: string
  updatedAt: number
}

interface NodePrompt {
  id: string
  title: string
  content: string
  updatedAt: number
}

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
  prds?: NodePRD[]        // Attached PRD documents
  prompts?: NodePrompt[]  // Attached IDE prompts
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
}
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
| `useUIStore` | `stores/ui-store.ts` | Selected node, panel open state |

### Key ProjectStore Methods

```typescript
interface ProjectState {
  currentProject: Project | null
  flowNodes: FlowNode[]
  flowEdges: FlowEdge[]

  // Project lifecycle
  setCurrentProject: (project: Project | null) => void
  initDraftProject: (userId: string) => void
  ingestPlan: (plan, userId) => Project
  mergeNodes: (newNodes: AIPlanNode[]) => void

  // Node CRUD
  updateNodeStatus: (nodeId, status) => void
  updateNodeContent: (nodeId, title, description) => void
  toggleNodeCollapse: (nodeId) => void
  deleteNode: (nodeId) => void
  addChildNode: (parentId, title) => string | null
  duplicateNode: (nodeId, includeChildren) => string | null
  changeNodeType: (nodeId, newType) => void
  addFreeNode: (type, title, parentId?) => string

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
  setNodeParent: (nodeId, parentId) => void
}
```

### planNodesToFlow Conversion

The `planNodesToFlow()` function converts `PlanNode[]` → `{ FlowNode[], FlowEdge[] }`:
- Filters out children of collapsed nodes
- Generates edges from `parentId` relationships
- Passes all data (content, images, prds, prompts) to flow node data

---

## Component Architecture (Actual)

```
components/
├── canvas/
│   ├── graph-canvas.tsx              # Main ReactFlow wrapper
│   ├── canvas-toolbar.tsx            # Re-layout button
│   ├── context-menu/
│   │   ├── node-context-menu.tsx     # Right-click on node
│   │   ├── pane-context-menu.tsx     # Right-click on empty canvas (smart mapping)
│   │   └── context-submenu.tsx       # Submenu helper
│   └── nodes/
│       ├── node-types.ts             # nodeTypes registry (7 types)
│       ├── base-plan-node.tsx        # Shared node layout (goal/subgoal/feature/task)
│       ├── goal-node.tsx             # Goal wrapper
│       ├── subgoal-node.tsx          # Subgoal wrapper
│       ├── feature-node.tsx          # Feature wrapper
│       ├── task-node.tsx             # Task wrapper
│       ├── moodboard-node.tsx        # Image grid node
│       ├── notes-node.tsx            # Rich text node
│       ├── connector-node.tsx        # Compact status waypoint
│       └── node-toolbar.tsx          # Hover toolbar (edit, status, collapse, add child)
├── chat/
│   ├── planning-chat.tsx             # AI chat panel
│   ├── chat-input.tsx                # Message input
│   ├── chat-message.tsx              # Message bubble
│   └── typing-indicator.tsx          # AI typing dots
├── panels/
│   ├── node-detail-panel.tsx         # Full detail panel (edit, PRDs, prompts, images)
│   ├── node-edit-form.tsx            # Title/description edit form
│   └── rich-text-editor.tsx          # Tiptap rich text editor
├── onboarding/
│   └── project-onboarding.tsx        # Multi-step questionnaire
├── dashboard/
│   ├── project-list.tsx              # Project cards grid
│   ├── project-card.tsx              # Single project card
│   ├── create-project-button.tsx     # New project button
│   └── empty-state.tsx               # No projects state
├── layout/
│   ├── header.tsx                    # Top navigation bar
│   ├── theme-toggle.tsx              # Dark/light toggle
│   └── user-menu.tsx                 # User avatar/menu
└── ui/                               # Reusable primitives
    ├── button.tsx
    ├── badge.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── input.tsx
    ├── skeleton.tsx
    └── textarea.tsx
```

---

## Key Flows

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

---

## Node Configuration (from `lib/constants.ts`)

```typescript
const NODE_CONFIG = {
  goal:      { label: 'Goal',      color: '#6366f1', width: 280, height: 80 },
  subgoal:   { label: 'Subgoal',   color: '#8b5cf6', width: 260, height: 70 },
  feature:   { label: 'Feature',   color: '#3b82f6', width: 240, height: 65 },
  task:      { label: 'Task',      color: '#22c55e', width: 220, height: 60 },
  moodboard: { label: 'Moodboard', color: '#f59e0b', width: 280, height: 200 },
  notes:     { label: 'Notes',     color: '#ec4899', width: 260, height: 150 },
  connector: { label: 'Connector', color: '#64748b', width: 120, height: 40 },
}
```

---

## Firebase (Optional, Guarded)

All Firebase usage is null-guarded so the app works without credentials:
- `services/firebase.ts` — Initializes only if env vars present
- `services/firestore.ts` — Returns early if `db` is null
- `services/auth.ts` — Returns early if `auth` is null

Without Firebase, the app runs entirely in-memory (Zustand state resets on refresh).

---

## Security

1. **API Keys**: Stored in `.env.local`, never committed (`.gitignore`)
2. **Firebase guarded**: App doesn't crash without Firebase keys
3. **No `dangerouslySetInnerHTML`**: All content rendered through React components
4. **Gemini key**: `NEXT_PUBLIC_` prefix means client-exposed — acceptable for this use case

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-01 | React Flow over D3.js | Built-in interactions, better React integration |
| 2025-01 | Zustand over Redux | Simpler API, sufficient for project scale |
| 2025-01 | Dagre over d3-force | Deterministic hierarchy layout vs physics jitter |
| 2026-02 | 7 node types over 4 | Moodboard/notes/connector needed for rich canvas vision |
| 2026-02 | PRDs + Prompts on nodes | Users need to attach IDE-ready content to plan nodes |
| 2026-02 | Smart mapping | Auto-suggest parent by hierarchy rules + proximity |
| 2026-02 | Firebase guarded | App must work without database for local dev |
| 2026-02 | AI PRD/prompt generation | One-click generation using full hierarchy context via Gemini |
