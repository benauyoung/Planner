# VisionPath — Full AI Handoff Document

> **Read `INTRO.md` first for the documentation system, then this file for codebase reality.**

---

## What Is VisionPath?

VisionPath is an **AI-powered visual project planning tool**. Users describe a project idea through a guided onboarding flow, then an AI (Gemini 2.0 Flash) builds a hierarchical plan as a **directed acyclic graph (DAG)** on an interactive canvas. Users can chat with the AI to refine the plan, click nodes to inspect/edit them, and manage project status.

**In short:** Describe your idea → AI builds a visual plan → Refine through chat → Execute tasks.

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
| Animation | Framer Motion | 11.11.17 |
| Icons | Lucide React | 0.462.0 |
| Markdown | react-markdown | 9.0.1 |
| Utilities | clsx, tailwind-merge | latest |

### NOT Yet Installed (Planned in docs but not in package.json)
- d3-force (spring physics)
- yjs / y-partykit / y-indexeddb (real-time collaboration)
- partykit (WebSocket server)
- chokidar (file watcher for territory sync)

---

## Environment Variables

```env
# Required - AI
NEXT_PUBLIC_GEMINI_API_KEY=<Gemini API key>

# Required - Database (Firebase)
NEXT_PUBLIC_FIREBASE_API_KEY=<key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<project>.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<app-id>
```

**Note:** `.env.local` currently only has `NEXT_PUBLIC_GEMINI_API_KEY` set. Firebase env vars are NOT configured yet — Firestore calls will fail until they are.

---

## Project Structure

```
Planner/
├── app/
│   ├── layout.tsx                    # Root layout (Inter font, Header)
│   ├── page.tsx                      # Dashboard — ProjectList
│   ├── globals.css                   # CSS variables, React Flow overrides
│   ├── project/
│   │   ├── new/page.tsx              # New project: Onboarding → Chat + Canvas
│   │   └── [id]/page.tsx             # Existing project: ProjectWorkspace
│   └── api/
│       └── ai/
│           ├── chat/route.ts         # POST - Gemini chat (progressive plan building)
│           └── suggest-features/route.ts  # POST - AI feature suggestions for onboarding
├── components/
│   ├── canvas/
│   │   ├── graph-canvas.tsx          # React Flow canvas with auto-layout
│   │   ├── canvas-toolbar.tsx        # Fit view, re-layout, expand/collapse all
│   │   ├── timeline-bar.tsx          # Goal progress circles at top
│   │   ├── nodes/
│   │   │   ├── base-plan-node.tsx    # Shared node component (handles, badges, status)
│   │   │   ├── goal-node.tsx         # Goal wrapper (orange)
│   │   │   ├── subgoal-node.tsx      # Subgoal wrapper (blue)
│   │   │   ├── feature-node.tsx      # Feature wrapper (green)
│   │   │   ├── task-node.tsx         # Task wrapper (violet)
│   │   │   └── node-types.ts        # nodeTypes registry for React Flow
│   │   └── context-menu/
│   │       ├── node-context-menu.tsx  # Right-click menu (edit, type, status, add, delete)
│   │       └── context-submenu.tsx    # Flyout submenu for type/status pickers
│   ├── chat/
│   │   ├── planning-chat.tsx         # Chat panel with message list + Save button
│   │   ├── chat-input.tsx            # Input with context chip ("Focused on: X")
│   │   ├── chat-message.tsx          # Message bubble (markdown rendered)
│   │   └── typing-indicator.tsx      # Loading dots
│   ├── dashboard/
│   │   ├── project-list.tsx          # Grid of project cards
│   │   ├── project-card.tsx          # Card with node counts + progress bar
│   │   ├── create-project-button.tsx # Link to /project/new
│   │   └── empty-state.tsx           # "No projects yet" state
│   ├── onboarding/
│   │   └── project-onboarding.tsx    # Full-screen multi-step questionnaire (6 steps + summary)
│   ├── panels/
│   │   ├── node-detail-panel.tsx     # Slide-in panel: edit, status, type, questions, children
│   │   └── node-edit-form.tsx        # Title + description inline edit
│   ├── project/
│   │   └── project-workspace.tsx     # Active project view (canvas + optional chat + detail panel)
│   ├── layout/
│   │   ├── header.tsx                # Top nav bar
│   │   └── theme-toggle.tsx          # Light/dark toggle
│   └── ui/                           # Reusable primitives (button, card, badge, dialog, input, etc.)
├── hooks/
│   ├── use-ai-chat.ts               # Chat logic: send message, init, context injection
│   ├── use-auto-layout.ts           # Dagre layout algorithm
│   └── use-project.ts               # Firestore load/save/auto-save with debounce
├── stores/
│   ├── project-store.ts             # Central state: project, nodes, edges, all mutations
│   ├── chat-store.ts                # Chat messages, phase, onboarding answers
│   └── ui-store.ts                  # Theme, selected node, detail panel open/close
├── services/
│   ├── firebase.ts                  # Firebase app init + Firestore instance
│   ├── firestore.ts                 # CRUD: getProjects, getProject, create, update, delete
│   └── gemini.ts                    # Gemini client singleton + response schema
├── prompts/
│   ├── planning-system.ts           # Main AI system prompt (progressive plan building)
│   └── refinement-system.ts         # Refinement prompt (unused currently)
├── lib/
│   ├── constants.ts                 # NODE_CONFIG, NODE_CHILD_TYPE, DAGRE_CONFIG, STATUS_COLORS
│   ├── feature-suggestions.ts       # Schema for AI feature suggestion response
│   ├── onboarding-config.ts         # 6 onboarding step definitions
│   ├── onboarding-message.ts        # Formats onboarding answers into AI prompt
│   ├── id.ts                        # generateId() — crypto.randomUUID
│   └── utils.ts                     # cn() — clsx + tailwind-merge
├── types/
│   ├── project.ts                   # Project, PlanNode, ProjectEdge, NodeType, NodeStatus
│   ├── canvas.ts                    # FlowNode, FlowEdge, PlanNodeData
│   └── chat.ts                      # ChatMessage, ChatPhase, OnboardingAnswers, AIPlanNode
├── INTRO.md                         # AI onboarding — READ FIRST
├── SESSION_CLOSEOUT.md              # End-of-session procedures
├── README.md                        # Project overview
├── VISION.md                        # North star goals
├── ARCHITECTURE.md                  # Tech stack & patterns
├── CONTRIBUTING.md                  # Coding standards
├── PLAN.md                          # Implementation task checklist
├── ROADMAP.md                       # Milestone tracking
├── SPEC_DEFS/                       # Feature specifications (canvas, nodes, physics, etc.)
└── LOGS/                            # Session logs
    ├── 2026-02-04-session.md        # Session 1: Node detail panel + contextual chat
    ├── 2026-02-05-session.md        # Session 2: Node actions (type, collapse, add child, duplicate)
    ├── 2026-02-05-session-2.md      # Session 3: Multi-step onboarding questionnaire
    └── _template.md                 # Session log template
```

---

## Data Model

### Project (Firestore document)
```typescript
interface Project {
  id: string
  title: string
  description: string
  phase: 'planning' | 'active'
  nodes: PlanNode[]
  edges: ProjectEdge[]
  createdAt: number   // Date.now()
  updatedAt: number
}
```

### PlanNode
```typescript
interface PlanNode {
  id: string                          // e.g. "goal-1", "subgoal-1-1"
  type: 'goal' | 'subgoal' | 'feature' | 'task'
  title: string
  description: string
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked'
  parentId: string | null             // null = root goal
  collapsed: boolean
  questions: NodeQuestion[]           // AI-generated decision questions
}
```

### Node Hierarchy
```
goal → subgoal → feature → task
```
Each type has specific colors, sizes, and icons defined in `lib/constants.ts`:
- **Goal**: Orange, 280×120, Target icon
- **Subgoal**: Blue, 260×110, Flag icon
- **Feature**: Green, 240×100, Puzzle icon
- **Task**: Violet, 220×90, CheckSquare icon

---

## Application Flow

### New Project Flow
```
/project/new
    ↓
ProjectOnboarding (6 steps: description, type, features, audience, timeline, team, priorities)
    ↓ onComplete(answers)
PlanningChat + GraphCanvas side-by-side
    ↓ AI builds plan progressively (30-60 nodes)
    ↓ User clicks "Save" when phase === 'done'
Redirect to /project/[id]
```

### Existing Project Flow
```
/ (Dashboard)
    ↓ click project card
/project/[id]
    ↓
ProjectWorkspace (canvas + toggleable chat + detail panel)
    - Click node → detail panel slides in, canvas zooms to node
    - Right-click node → context menu
    - Chat messages are contextual to selected node
    - Auto-saves to Firestore every 2 seconds (debounced)
```

### AI Chat Flow
```
User message → use-ai-chat.ts
    ↓ If node selected: inject context into message
    ↓ POST /api/ai/chat
    ↓ Gemini returns: { message, nodes[], suggestedTitle, done }
    ↓ mergeNodes() upserts into project store
    ↓ planNodesToFlow() converts to React Flow format
    ↓ Auto-layout via dagre
    ↓ fitView() with animation
```

---

## State Architecture

### Three Zustand Stores

**`project-store.ts`** (381 lines — the big one)
- `currentProject`, `projects`, `flowNodes`, `flowEdges`
- Key mutations: `mergeNodes`, `ingestPlan`, `updateNodeStatus`, `updateNodeContent`, `toggleNodeCollapse`, `deleteNode`, `addChildNode`, `duplicateNode`, `changeNodeType`, `answerNodeQuestion`
- `planNodesToFlow()` converts PlanNode[] → React Flow nodes/edges (respects collapsed state)

**`chat-store.ts`**
- `messages`, `phase` ('onboarding' | 'greeting' | 'planning' | 'done'), `onboardingAnswers`

**`ui-store.ts`**
- `theme`, `selectedNodeId`, `detailPanelOpen`

---

## What's Been Built (3 Sessions)

### Session 1 (Feb 4) — Node Detail Panel + Contextual Chat
- Click a node → slide-in detail panel with edit, status
- Canvas zooms to selected node + its connections
- Chat input shows "Focused on: [title]" context chip
- AI receives enriched message with node context

### Session 2 (Feb 5, Session 1) — Node Actions
- Change node type (goal ↔ subgoal ↔ feature ↔ task)
- Collapse/expand children
- Add child node (inline input)
- Duplicate node with full subtree clone
- Right-click context menu with submenus

### Session 3 (Feb 5, Session 2) — Onboarding Questionnaire
- Full-screen multi-step flow (6 questions + summary review)
- AI-suggested features based on project description
- Answers formatted into rich initial message for Gemini
- AI immediately builds comprehensive plan from context

---

## What's NOT Built Yet

From `PLAN.md` and `ROADMAP.md`, the following are planned but not implemented:

| Feature | Status | Spec File |
|---------|--------|-----------|
| Spring physics (d3-force) | Not started | `SPEC_DEFS/physics.md` |
| Bidirectional file sync (territory) | Not started | `SPEC_DEFS/file-sync.md` |
| Real-time collaboration (Yjs) | Not started | `SPEC_DEFS/collaboration.md` |
| AI decompose/plan/review actions | Not started | `SPEC_DEFS/ai-integration.md` |
| Authentication | Not started | — |
| Firebase env vars not configured | Blocking | `.env.example` |
| Dark mode toggle (component exists) | Wired but no persistence | `stores/ui-store.ts` |
| Simulation mode | Not started | `prompts/refinement-system.ts` exists |

---

## Key Patterns to Follow

1. **All state in Zustand** — no useState for shared data
2. **`planNodesToFlow()`** — always call after mutating nodes to sync React Flow
3. **Dagre for layout** — `useAutoLayout` hook, LR direction, triggered on node count change
4. **AI responses are structured JSON** — Gemini uses `responseSchema` for typed output
5. **Merge by ID** — `mergeNodes()` upserts; same ID = update, new ID = add
6. **Auto-save** — `useProject` hook debounces saves to Firestore every 2 seconds
7. **Context injection** — selected node info is prepended to AI messages (client-side only)

---

## Known Issues / Warnings

1. **Firebase not configured** — `.env.local` only has Gemini key. Firestore calls will fail.
2. **SWC warning on build** — pre-existing environment issue, not code-related
3. **`changeNodeType` has no hierarchy validation** — user can change a goal with subgoal children to a task
4. **`duplicateNode` is recursive** — large subtrees create many nodes at once
5. **Chat phase must be 'greeting' for saved projects** — `project-workspace.tsx` force-sets this to bypass onboarding
6. **No auth** — anyone with the URL can access projects
7. **`refinement-system.ts` is unused** — only `planning-system.ts` is active

---

## Commands

```bash
pnpm dev          # Start dev server (port 3000)
pnpm build        # Production build
pnpm type-check   # TypeScript check (tsc --noEmit)
pnpm lint         # ESLint
```

---

## Task Philosophy

| Principle | Rule |
|-----------|------|
| **Sprint Size** | Every task is a 1-2 hour actionable sprint |
| **Single Source** | All tasks live in `PLAN.md` |
| **Deadlines** | Every task has a deadline or target date |
| **Sequential** | Work tasks in order — don't skip ahead |

---

## How to Start Working

1. Read `INTRO.md` for documentation system
2. Read `PLAN.md` to find the next uncompleted task
3. Read the relevant `SPEC_DEFS/*.md` for that task
4. Read `CONTRIBUTING.md` for coding standards
5. Check the latest `LOGS/*.md` for context from the last session
6. Work the task
7. When done, follow `SESSION_CLOSEOUT.md`
