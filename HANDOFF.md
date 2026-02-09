# VisionPath — Full AI Handoff Document

> Complete codebase reference. Updated February 2026.

---

## What Is VisionPath?

VisionPath is an **AI-powered visual project planning tool**. Users describe a project idea through a guided onboarding flow, then AI (Gemini 2.0 Flash) builds a hierarchical plan as a **directed acyclic graph (DAG)** on an interactive canvas. Users can:

- Chat with AI to refine the plan
- Click nodes to inspect/edit them
- Attach PRDs and IDE prompts to nodes (copy-to-clipboard)
- Upload images for mood boards
- Right-click to create nodes anywhere on canvas with smart parent suggestion
- Drag edges between nodes to set relationships

**In short:** Describe your idea → AI builds a visual plan → Refine with rich content → Copy prompts into your IDE.

---

## Tech Stack (Actual, Installed)

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 15.1.3 |
| Language | TypeScript | 5.x |
| React | React | 19.0.0 |
| Canvas | @xyflow/react (React Flow) | 12.3.2 |
| Layout | dagre | 0.8.5 |
| State | Zustand | 5.0.2 |
| AI | @google/generative-ai (Gemini) | 0.21.0 |
| Database | Firebase Firestore | 12.8.0 |
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
│       └── suggest-features/route.ts # POST - AI feature suggestions for onboarding
├── components/
│   ├── canvas/
│   │   ├── graph-canvas.tsx          # React Flow canvas (onConnect, context menus, layout)
│   │   ├── canvas-toolbar.tsx        # Re-layout button
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
│   │       ├── node-context-menu.tsx  # Right-click node menu
│   │       ├── pane-context-menu.tsx  # Right-click canvas (add node + smart mapping)
│   │       └── context-submenu.tsx    # Flyout submenu helper
│   ├── chat/
│   │   ├── planning-chat.tsx         # Chat panel with message list + Save
│   │   ├── chat-input.tsx            # Input with context chip
│   │   ├── chat-message.tsx          # Message bubble (markdown)
│   │   └── typing-indicator.tsx      # Loading dots
│   ├── dashboard/
│   │   ├── project-list.tsx          # Grid of project cards
│   │   ├── project-card.tsx          # Card with node counts
│   │   ├── create-project-button.tsx # Link to /project/new
│   │   └── empty-state.tsx           # No projects state
│   ├── onboarding/
│   │   └── project-onboarding.tsx    # Multi-step questionnaire (7 steps + summary)
│   ├── panels/
│   │   ├── node-detail-panel.tsx     # Full panel: edit, PRDs, prompts, images, children
│   │   ├── node-edit-form.tsx        # Title + description inline edit
│   │   └── rich-text-editor.tsx      # Tiptap rich text editor
│   ├── project/
│   │   └── project-workspace.tsx     # Canvas + chat + detail panel layout
│   ├── layout/
│   │   ├── header.tsx                # Top nav bar
│   │   ├── theme-toggle.tsx          # Dark/light toggle
│   │   └── user-menu.tsx             # User avatar/menu
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
│   └── gemini.ts                    # Gemini client + response schema
├── prompts/
│   ├── planning-system.ts           # Main AI system prompt
│   └── refinement-system.ts         # Refinement prompt (unused)
├── lib/
│   ├── constants.ts                 # NODE_CONFIG (7 types), NODE_CHILD_TYPE, DAGRE_CONFIG
│   ├── feature-suggestions.ts       # AI feature suggestion schema
│   ├── onboarding-config.ts         # Onboarding step definitions
│   ├── onboarding-message.ts        # Formats answers into AI prompt
│   ├── id.ts                        # generateId() — crypto.randomUUID
│   └── utils.ts                     # cn() — clsx + tailwind-merge
├── types/
│   ├── project.ts                   # PlanNode, NodePRD, NodePrompt, Project, NodeType
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
| Type | Color | Width | Height | Icon |
|------|-------|-------|--------|------|
| Goal | #6366f1 (indigo) | 280 | 80 | Target |
| Subgoal | #8b5cf6 (violet) | 260 | 70 | GitBranch |
| Feature | #3b82f6 (blue) | 240 | 65 | Puzzle |
| Task | #22c55e (green) | 220 | 60 | CheckSquare |
| Moodboard | #f59e0b (amber) | 280 | 200 | ImagePlus |
| Notes | #ec4899 (pink) | 260 | 150 | FileText |
| Connector | #64748b (slate) | 120 | 40 | Circle |

---

## Key Store Methods (`project-store.ts`)

**Node CRUD**: `addChildNode`, `addFreeNode`, `deleteNode`, `duplicateNode`, `changeNodeType`, `toggleNodeCollapse`, `updateNodeContent`, `updateNodeStatus`

**Rich Content**: `updateNodeRichContent`, `addNodeImage`, `removeNodeImage`

**PRDs**: `addNodePRD`, `updateNodePRD`, `removeNodePRD`

**Prompts**: `addNodePrompt`, `updateNodePrompt`, `removeNodePrompt`

**Connections**: `connectNodes`, `setNodeParent`

**AI Integration**: `mergeNodes`, `ingestPlan`

**Flow Conversion**: `planNodesToFlow()` — converts PlanNode[] → FlowNode[] + FlowEdge[]

---

## Application Flows

### New Project
```
/project/new → Onboarding (7 steps) → AI suggests features → Summary → Start Planning
→ PlanningChat + GraphCanvas → AI builds nodes → User clicks Save → /project/[id]
```

### Canvas Interactions
- **Click node** → Detail panel opens (edit, PRDs, prompts, images, children)
- **Right-click node** → Context menu (edit, type, status, add child/sibling, duplicate, delete)
- **Right-click empty canvas** → Pane context menu (add any node type, smart parent suggestion)
- **Drag source→target handle** → Creates edge (sets parentId)
- **Re-layout button** → Dagre auto-layout

### Smart Mapping
When right-clicking empty canvas, the pane context menu shows an arrow (→) button next to node types that have a valid parent nearby. Hierarchy rules:
- subgoal → goal
- feature → subgoal, goal
- task → feature, subgoal

The nearest valid parent is found by Euclidean distance between flow positions.

---

## Key Patterns

1. **All shared state in Zustand** — component-local state only for UI
2. **`planNodesToFlow()`** — always called after node mutations to sync React Flow
3. **Dagre for layout** — `useAutoLayout` hook, TB direction, triggered on node count change
4. **AI responses are structured JSON** — Gemini uses `responseSchema` for typed output
5. **Merge by ID** — `mergeNodes()` upserts; same ID = update, new ID = add
6. **Firebase null-guarded** — all services return early if Firebase not initialized
7. **Images as base64** — stored directly in PlanNode, no external storage needed

---

## Known Issues

1. **No persistence without Firebase** — state resets on page refresh
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
5. The next big features are: **persistence** (Firebase/localStorage), **keyboard shortcuts**, and **export/import**
