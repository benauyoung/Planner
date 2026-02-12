# VisionPath — Full AI Handoff Document

> Complete codebase reference. Updated February 12, 2026.

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
- **6 views**: Canvas, List, Table, Board (Kanban), Timeline (Gantt), Sprints
- **Command palette** (Cmd+K) with fuzzy search + keyboard shortcuts
- **Team management**: Assign members, set priority, due dates, estimates, tags
- **AI iteration**: Break down, audit, estimate, suggest dependencies — accept/dismiss per suggestion
- **Comments & activity feed**: Threaded comments on nodes, project-level activity timeline
- **Sprint planning**: Create sprints, drag tasks from backlog, progress tracking
- **AI smart suggestions**: Ambient project analysis with severity-ranked insights
- **Embedded docs**: Notion-style block editor (headings, code, checklists, callouts, dividers)
- **Version history**: Save/restore named snapshots with branch support
- **Integrations**: GitHub, Slack, Linear service clients + settings UI
- **Collaboration infrastructure**: Presence avatars, live cursors, pluggable provider

**In short:** Describe your idea → AI builds a visual plan → Refine with rich content → Plan sprints → Track with multiple views → Generate PRDs & prompts → Collaborate & integrate.

---

## Live URLs

| Environment | URL |
|-------------|-----|
| **Production** | https://planner-ruby-seven.vercel.app/ |
| **GitHub** | https://github.com/benauyoung/Planner |
| **Local Dev** | http://localhost:3000 |

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
| Auth | Firebase Auth | 12.9.0 |
| Rich Text | @tiptap/react + starter-kit | 3.19.0 |
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

**Note:** Firebase is fully optional. All Firebase services (`firebase.ts`, `firestore.ts`, `auth.ts`) are null-guarded — the app runs entirely with localStorage fallback when Firebase is not configured. Additionally, the persistence layer (`services/persistence.ts`) has a **runtime failover**: if Firestore is configured but unavailable at runtime (e.g. database not provisioned), all calls automatically fall back to localStorage after the first failure.

---

## Routing Architecture

VisionPath uses **Next.js Route Groups** to separate public marketing pages from authenticated application routes:

```
app/
├── layout.tsx                          # Root layout (html, body, Inter font, metadata ONLY)
├── globals.css                         # CSS variables, node colors, React Flow overrides
├── icon.svg                            # App icon (compass)
│
├── (marketing)/                        # PUBLIC — no auth, own nav + footer
│   ├── layout.tsx                      # MarketingLayout: LandingNavBar + Footer
│   └── page.tsx                        # Landing page (/ route) — hero, trust, features, CTA
│
├── (app)/                              # AUTHENTICATED — auth-guarded, app header
│   ├── layout.tsx                      # AppLayout: AuthProvider + Header + ErrorBoundary
│   ├── dashboard/page.tsx              # Dashboard (/dashboard) — ProjectList
│   ├── login/page.tsx                  # Login (/login) — email/password + Google sign-in
│   ├── project/
│   │   ├── new/page.tsx                # New project (/project/new) — onboarding flow
│   │   └── [id]/page.tsx              # Project workspace (/project/[id]) — canvas + chat
│   └── share/[id]/page.tsx            # Shared plan (/share/[id]) — read-only view
│
└── api/ai/                             # API routes (server-side, not in route groups)
    ├── chat/route.ts                   # POST — Gemini chat (progressive plan building)
    ├── suggest-features/route.ts       # POST — AI feature suggestions for onboarding
    ├── generate-prd/route.ts           # POST — AI PRD generation from node context
    ├── generate-prompt/route.ts        # POST — AI implementation prompt generation
    └── generate-questions/route.ts     # POST — AI question generation for nodes
```

### Route Summary

| URL | Route Group | Auth Required | Description |
|-----|-------------|---------------|-------------|
| `/` | `(marketing)` | No | Public landing page |
| `/login` | `(app)` | No (redirects to /dashboard if authed) | Login page |
| `/dashboard` | `(app)` | Yes | Project list dashboard |
| `/project/new` | `(app)` | Yes | New project creation |
| `/project/[id]` | `(app)` | Yes | Project canvas workspace |
| `/share/[id]` | `(app)` | No | Read-only shared plan view |

### Auth Flow
- Unauthenticated users on protected routes → redirected to `/login`
- Authenticated users on `/login` → redirected to `/dashboard`
- Landing page (`/`) is always public, no auth check
- `AuthProvider` only wraps `(app)` routes, not `(marketing)` routes

---

## Project Structure (Complete)

```
Planner/
├── app/
│   ├── layout.tsx                      # Root layout (Inter font, favicon metadata ONLY)
│   ├── globals.css                     # CSS variables, node colors, React Flow overrides
│   ├── icon.svg                        # App icon (compass SVG)
│   ├── (marketing)/
│   │   ├── layout.tsx                  # LandingNavBar + Footer wrapper
│   │   └── page.tsx                    # Landing page sections assembly
│   ├── (app)/
│   │   ├── layout.tsx                  # AuthProvider + Header + ErrorBoundary
│   │   ├── dashboard/page.tsx          # ProjectList dashboard
│   │   ├── login/page.tsx              # Firebase auth (email + Google)
│   │   ├── project/
│   │   │   ├── new/page.tsx            # New project: Onboarding → Chat + Canvas
│   │   │   └── [id]/page.tsx           # Existing project: ProjectWorkspace
│   │   └── share/[id]/page.tsx         # Read-only shared plan
│   └── api/ai/
│       ├── chat/route.ts               # POST — Gemini chat
│       ├── suggest-features/route.ts   # POST — AI feature suggestions
│       ├── generate-prd/route.ts       # POST — AI PRD generation
│       ├── generate-prompt/route.ts    # POST — AI prompt generation
│       ├── generate-questions/route.ts # POST — AI question generation
│       ├── iterate/route.ts            # POST — AI iteration (break down, audit, estimate)
│       └── analyze/route.ts            # POST — AI smart suggestions analysis
├── components/
│   ├── landing/                        # Landing page components (public)
│   │   ├── nav-bar.tsx                 # Sticky nav, transparent → blur on scroll, mobile menu
│   │   ├── hero-section.tsx            # Split-screen hero: headline + CTA / animated mockup
│   │   ├── hero-mockup.tsx             # SVG/CSS animated canvas mockup (nodes + edges)
│   │   ├── trust-bar.tsx               # Social proof badges (Station 8, Pioneers VC)
│   │   ├── how-it-works.tsx            # 3-step workflow (Describe → Generate → Refine)
│   │   ├── features-grid.tsx           # 6-card feature showcase
│   │   ├── cta-banner.tsx              # Full-width gradient CTA section
│   │   └── footer.tsx                  # 4-column footer with links + social icons
│   ├── canvas/
│   │   ├── graph-canvas.tsx            # React Flow canvas (blast radius, typed edges, onConnect)
│   │   ├── canvas-toolbar.tsx          # Export dropdown, blast radius toggle, undo/redo
│   │   ├── timeline-bar.tsx            # Goal progress circles
│   │   ├── nodes/
│   │   │   ├── base-plan-node.tsx      # Shared node (goal/subgoal/feature/task)
│   │   │   ├── goal-node.tsx           # Goal wrapper
│   │   │   ├── subgoal-node.tsx        # Subgoal wrapper
│   │   │   ├── feature-node.tsx        # Feature wrapper
│   │   │   ├── task-node.tsx           # Task wrapper
│   │   │   ├── moodboard-node.tsx      # Image grid node
│   │   │   ├── notes-node.tsx          # Rich text node
│   │   │   ├── connector-node.tsx      # Compact status waypoint
│   │   │   ├── node-toolbar.tsx        # Hover toolbar (edit, status, collapse, add child)
│   │   │   └── node-types.ts           # nodeTypes registry (7 types)
│   │   └── context-menu/
│   │       ├── node-context-menu.tsx   # Right-click node (+ dependency edge creation)
│   │       ├── pane-context-menu.tsx   # Right-click canvas (add node + smart mapping)
│   │       └── context-submenu.tsx     # Flyout submenu helper
│   ├── views/                          # Multiple view components
│   │   ├── view-switcher.tsx           # Tab bar: Canvas / List / Table / Board / Timeline / Sprints
│   │   ├── list-view.tsx               # Hierarchical tree with expand/collapse
│   │   ├── table-view.tsx              # Sortable/filterable grid with priority + assignee columns
│   │   ├── board-view.tsx              # Kanban by status with drag-and-drop
│   │   └── timeline-view.tsx           # Gantt chart with day grid, month headers, status bars
│   ├── sprints/
│   │   └── sprint-board.tsx            # Sprint overview: create, drag backlog, progress bars
│   ├── ai/
│   │   ├── ai-suggestions-panel.tsx    # AI iteration suggestions (accept/dismiss per suggestion)
│   │   └── smart-suggestions-panel.tsx # Ambient AI analysis with severity-ranked insights
│   ├── comments/
│   │   ├── comment-thread.tsx          # Comment thread with add/delete
│   │   └── activity-feed.tsx           # Chronological project activity timeline
│   ├── editor/
│   │   └── block-editor.tsx            # Notion-style block editor (headings, code, checklists, callouts)
│   ├── versions/
│   │   └── version-history.tsx         # Save/restore/delete version snapshots
│   ├── collaboration/
│   │   ├── presence-avatars.tsx        # Who's online avatars with status dots
│   │   └── presence-cursors.tsx        # Live cursor rendering with name labels
│   ├── integrations/
│   │   └── integration-settings.tsx    # GitHub/Slack/Linear connect/disconnect UI
│   ├── chat/
│   │   ├── planning-chat.tsx           # Chat panel with message list + Save
│   │   ├── chat-input.tsx              # Input with context chip
│   │   ├── chat-message.tsx            # Message bubble (markdown)
│   │   └── typing-indicator.tsx        # Loading dots
│   ├── dashboard/
│   │   ├── project-list.tsx            # Grid of project cards + import buttons
│   │   ├── project-card.tsx            # Card with node counts
│   │   ├── dashboard-loader.tsx        # Animated loading screen (floating nodes, spinning compass)
│   │   ├── create-project-button.tsx   # Link to /project/new
│   │   ├── import-project-button.tsx   # JSON import button
│   │   ├── import-markdown-modal.tsx   # Markdown import modal with preview
│   │   └── empty-state.tsx             # No projects state
│   ├── onboarding/
│   │   ├── project-onboarding.tsx      # Multi-step questionnaire (7 steps + summary)
│   │   ├── new-project-chooser.tsx     # 3-option entry: AI Chat / Template / Import
│   │   └── template-gallery.tsx        # Template cards with use button
│   ├── panels/
│   │   ├── node-detail-panel.tsx       # Full panel: edit, PRDs, prompts, images, priority, assignee, tags, document, comments
│   │   ├── node-edit-form.tsx          # Title + description inline edit
│   │   └── rich-text-editor.tsx        # Tiptap rich text editor
│   ├── share/
│   │   ├── share-button.tsx            # Share popover (public/private toggle, copy link)
│   │   └── shared-plan-view.tsx        # Read-only canvas for shared plans
│   ├── project/
│   │   ├── project-workspace.tsx       # Canvas + views + chat + panels + modals
│   │   └── team-manager.tsx            # Modal to add/remove team members
│   ├── layout/
│   │   ├── header.tsx                  # App header (Compass icon + VisionPath → /dashboard)
│   │   ├── theme-toggle.tsx            # Dark/light toggle
│   │   └── user-menu.tsx               # User avatar/menu
│   ├── error-boundary.tsx              # React error boundary component
│   └── ui/                             # Reusable primitives
│       ├── command-palette.tsx          # Cmd+K fuzzy search command palette
│       ├── shortcuts-help.tsx           # Keyboard shortcut help overlay
│       ├── priority-badge.tsx           # Priority badge + selector
│       ├── assignee-picker.tsx          # Assignee dropdown with avatars
│       ├── tag-input.tsx                # Tag chips with add/remove
│       └── (button, card, badge, skeleton, etc.)
├── hooks/
│   ├── use-ai-chat.ts                 # Chat logic: send, init, context injection
│   ├── use-ai-iterate.ts              # AI iteration actions (break down, audit, estimate)
│   ├── use-ai-suggestions.ts          # Smart suggestions hook (analyze project)
│   ├── use-auto-layout.ts             # Dagre layout algorithm
│   ├── use-collaboration.ts            # Collaboration provider hook (presence, cursors)
│   └── use-project.ts                 # Persistence load/save with 2s debounce
├── stores/
│   ├── project-store.ts               # Central state: project, nodes, edges, sprints, versions, 55+ mutations
│   ├── chat-store.ts                  # Chat messages, phase, onboarding answers
│   └── ui-store.ts                    # Theme, selected node, view, filters, pending edge
├── services/
│   ├── firebase.ts                    # Firebase init (null-guarded)
│   ├── firestore.ts                   # CRUD (null-guarded)
│   ├── auth.ts                        # Auth functions (null-guarded)
│   ├── gemini.ts                      # Gemini client + response schemas (chat, PRD, prompt, iteration, suggestion)
│   ├── persistence.ts                 # Persistence abstraction: Firestore → localStorage failover
│   ├── local-storage.ts              # localStorage backend for offline persistence
│   ├── collaboration.ts               # Collaboration provider abstraction (pluggable, local mock)
│   └── integrations/
│       ├── github.ts                  # GitHub issue creation/fetch
│       ├── slack.ts                   # Slack webhook message builders
│       └── linear.ts                  # Linear GraphQL client
├── prompts/
│   ├── planning-system.ts             # Main AI system prompt
│   ├── prd-generation.ts              # PRD generation system prompt
│   ├── prompt-generation.ts           # Implementation prompt generation system prompt
│   ├── question-generation.ts         # AI question generation system prompt
│   ├── iteration-system.ts            # AI iteration actions system prompt
│   ├── suggestion-system.ts           # Ambient AI analysis system prompt
│   └── refinement-system.ts           # Refinement prompt (unused)
├── lib/
│   ├── constants.ts                   # NODE_CONFIG (7 types), NODE_CHILD_TYPE, DAGRE_CONFIG
│   ├── commands.ts                    # Command palette command definitions
│   ├── node-context.ts                # buildNodeContext() — hierarchy context for AI generation
│   ├── export-import.ts               # JSON export/import with download/read helpers
│   ├── export-markdown.ts             # Subtree + full plan markdown export
│   ├── export-project-files.ts        # .cursorrules, CLAUDE.md, plan.md, tasks.md generators
│   ├── import-markdown.ts             # Markdown spec parser (headings, checklists, frontmatter)
│   ├── blast-radius.ts                # Downstream impact analysis (getBlastRadius)
│   ├── templates/                     # Seed plan templates
│   │   ├── index.ts                   # Template registry (3 templates)
│   │   ├── auth-system.ts             # SaaS Authentication System (24 nodes)
│   │   ├── crud-api.ts                # REST API with CRUD (22 nodes)
│   │   └── landing-page.ts            # Marketing Landing Page (20 nodes)
│   ├── feature-suggestions.ts         # AI feature suggestion schema
│   ├── onboarding-config.ts           # Onboarding step definitions
│   ├── onboarding-message.ts          # Formats answers into AI prompt
│   ├── id.ts                          # generateId() — crypto.randomUUID
│   └── utils.ts                       # cn() — clsx + tailwind-merge
├── types/
│   ├── project.ts                     # PlanNode, ProjectEdge, Sprint, ProjectVersion, DocumentBlock, etc.
│   ├── integrations.ts               # GitHub/Slack/Linear integration types
│   ├── canvas.ts                      # FlowNode, FlowEdge, PlanNodeData
│   └── chat.ts                        # ChatMessage, AIPlanNode
├── contexts/
│   └── auth-context.tsx               # Firebase auth context provider
├── public/
│   └── favicon.svg                    # Browser favicon
├── netlify.toml                       # Netlify deploy config (optional, Vercel is primary)
├── next.config.js                     # Next.js config (reactStrictMode: true)
├── tailwind.config.ts                 # Tailwind with custom node-type color tokens
├── tsconfig.json                      # TypeScript config with path aliases
└── package.json                       # Dependencies and scripts
```

---

## Data Model

### PlanNode (7 types)
```typescript
type NodeType = 'goal' | 'subgoal' | 'feature' | 'task' | 'moodboard' | 'notes' | 'connector'
type Priority = 'critical' | 'high' | 'medium' | 'low' | 'none'

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
  assigneeId?: string       // Team member ID
  priority?: Priority
  dueDate?: number          // Unix timestamp
  estimatedHours?: number
  tags?: string[]
  comments?: NodeComment[]
  sprintId?: string         // Sprint assignment
  document?: NodeDocument   // Notion-style block document
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
  isPublic?: boolean
  shareId?: string
  team?: TeamMember[]       // Project-level team roster
  activity?: ActivityEvent[]
  sprints?: Sprint[]
  versions?: ProjectVersion[]
  currentVersionId?: string
}
```

### Supporting Types
```typescript
interface TeamMember { id, name, email, avatar?, color }
interface NodeComment { id, authorId, authorName, authorColor, content, createdAt }
interface ActivityEvent { id, type, nodeId, nodeTitle, actorName, detail, timestamp }
interface Sprint { id, name, startDate, endDate, nodeIds, status: 'planning'|'active'|'completed' }
interface ProjectVersion { id, name, snapshot: { nodes, edges, title, description }, parentVersionId?, createdAt }
type DocumentBlock = heading | paragraph | code | checklist | divider | callout
interface NodeDocument { id, blocks: DocumentBlock[], updatedAt }
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

**Assignees & Metadata**: `setNodeAssignee`, `setNodePriority`, `setNodeDueDate`, `setNodeEstimate`, `setNodeTags`

**Team**: `addTeamMember`, `removeTeamMember`

**Comments & Activity**: `addNodeComment`, `deleteNodeComment`, `addActivityEvent`

**Sprints**: `createSprint`, `updateSprint`, `deleteSprint`, `assignNodeToSprint`

**Versions**: `saveVersion`, `restoreVersion`, `deleteVersion`

**Documents**: `updateNodeDocument`

**Sharing**: `toggleShareProject`

**Flow State**: `setFlowNodes`, `setFlowEdges`

**Undo/Redo**: `undo`, `redo` (with `canUndo`, `canRedo` state)

**Flow Conversion**: `planNodesToFlow(nodes, projectEdges)` — converts PlanNode[] + ProjectEdge[] → FlowNode[] + FlowEdge[]

---

## Application Flows

### Landing Page → Login → Dashboard
```
/ (Landing Page — public)
  → "Get Started" CTA → /login
  → User signs in (email/password or Google)
  → Redirect to /dashboard
  → DashboardLoader animation while projects load
  → ProjectList appears (or EmptyState)
```

### New Project
```
/project/new → NewProjectChooser (AI Chat / Template / Import)
  → AI Chat: Onboarding (7 steps) → AI suggests features → Summary → Start Planning
  → Template: TemplateGallery → choose template → ingestPlan() → /project/[id]
  → Import: ImportMarkdownModal → paste/upload markdown → create project
```

### Canvas Interactions
- **Click node** → Detail panel opens (edit, PRDs, prompts, images, priority, assignee, tags, document, comments, AI generate)
- **Right-click node** → Context menu (edit, type, status, add child/sibling, duplicate, delete, add dependency edge)
- **Right-click empty canvas** → Pane context menu (add any node type, smart parent suggestion)
- **Drag source→target handle** → Creates edge (sets parentId, or typed dependency if pendingEdge)
- **Re-layout button** → Dagre auto-layout
- **Blast radius toggle** → Dims unaffected nodes when a node is selected
- **Export dropdown** → JSON, Markdown, .cursorrules, CLAUDE.md, plan.md, tasks.md
- **Share button** → Public/private toggle with shareable URL
- **Cmd+K** → Command palette with fuzzy search
- **View switcher** → Canvas / List / Table / Board / Timeline / Sprints
- **Toolbar buttons** → Team Manager, AI Smart Suggestions, Version History, Integrations

### Smart Mapping
When right-clicking empty canvas, the pane context menu shows an arrow (→) button next to node types that have a valid parent nearby. Hierarchy rules:
- subgoal → goal
- feature → subgoal, goal
- task → feature, subgoal

The nearest valid parent is found by Euclidean distance between flow positions.

---

## Persistence Architecture

```
services/persistence.ts (abstraction layer)
  ├── Try: services/firestore.ts (Firebase Firestore)
  │         └── Uses: services/firebase.ts (init, null-guarded)
  └── Fallback: services/local-storage.ts (browser localStorage)
```

The `withFallback()` wrapper in `persistence.ts` handles three scenarios:
1. **Firebase not configured** (no env vars) → uses localStorage from the start
2. **Firebase configured and working** → uses Firestore
3. **Firebase configured but unavailable** (e.g. database not provisioned) → tries Firestore on first call, catches error, logs one warning, permanently falls back to localStorage for all subsequent calls

Auto-save runs via `use-project.ts` with a 2-second debounce.

---

## Landing Page Architecture

The landing page lives in the `(marketing)` route group at `/` and is fully public (no auth wrapper).

### Sections (top to bottom)
1. **Nav Bar** (`nav-bar.tsx`) — Sticky, transparent → blurred on scroll, Compass icon + "VisionPath" brand, links to How It Works / Features / Login, "Get Started" CTA, mobile hamburger menu
2. **Hero** (`hero-section.tsx` + `hero-mockup.tsx`) — Split screen: left side has headline ("See Your Entire Project. At a Glance."), subheadline, "Get Started — Free" CTA; right side has animated SVG canvas mockup with 5 colored nodes, dashed curved edges, hover float effects, Framer Motion entrance animations
3. **Trust Bar** (`trust-bar.tsx`) — Horizontal strip: "Station 8 Developed", "Pioneers VC Approved" with Shield + Award icons
4. **How It Works** (`how-it-works.tsx`) — 3 steps: Describe Your Idea → AI Generates Your Plan → Refine & Build, each with icon + title + description
5. **Features Grid** (`features-grid.tsx`) — 6 cards: Visual DAG Canvas, AI Co-Pilot, Rich Content, Dependency Tracking, Export Anywhere, Templates
6. **CTA Banner** (`cta-banner.tsx`) — Full-width gradient section, "Start planning in 30 seconds" + "Get Started — Free" button
7. **Footer** (`footer.tsx`) — 4-column layout: brand description, Product links, Company links, Legal links; bottom bar with copyright + social icons (GitHub, Twitter, LinkedIn)

---

## Dashboard Loading Screen

When the user lands on `/dashboard` after login, `DashboardLoader` (`components/dashboard/dashboard-loader.tsx`) shows an animated loading screen while projects are fetched:

- **Floating node rectangles** in the background using real node-type CSS color variables, with Framer Motion float + scale animations
- **Dashed connection lines** (SVG) that draw in progressively
- **Spinning compass icon** (the VisionPath brand icon) with a primary glow halo
- **"Loading your workspace"** text with three pulsing dots

This replaces the old skeleton card placeholders for a more branded experience.

---

## Key Patterns

1. **Route groups** — `(marketing)` for public pages, `(app)` for authenticated pages; root layout is minimal (html/body/fonts only)
2. **All shared state in Zustand** — component-local state only for UI
3. **`planNodesToFlow(nodes, edges)`** — always called after node mutations to sync React Flow (hierarchy + typed edges)
4. **Dagre for layout** — `useAutoLayout` hook, TB direction, triggered on node count change
5. **AI responses are structured JSON** — Gemini uses `responseSchema` for typed output
6. **AI generation uses full context** — `buildNodeContext()` gathers parent chain, Q&A, siblings, children
7. **Merge by ID** — `mergeNodes()` upserts; same ID = update, new ID = add
8. **Firebase null-guarded + runtime failover** — all services return early if Firebase not initialized; persistence layer auto-falls back to localStorage on Firestore errors
9. **Images as base64** — stored directly in PlanNode, no external storage needed
10. **Typed edges** — `blocks` (red dashed, animated) and `depends_on` (blue dashed) with labels
11. **Blast radius** — `getBlastRadius()` recursively traverses hierarchy + dependency edges
12. **Multi-format export** — JSON, AI-optimized Markdown, Spec Kit files (.cursorrules, CLAUDE.md)
13. **Markdown import** — heading levels map to node types (# → goal, ## → subgoal, ### → feature, #### → task)

---

## Known Issues

1. **Firestore "Database not found"** — On Vercel, if the Firestore database isn't provisioned in the Firebase console, the persistence layer catches this and silently falls back to localStorage. One warning is logged.
2. **SWC warning on build** — pre-existing Windows environment issue, not code-related
3. **`changeNodeType` has no hierarchy validation** — user can change a goal to a task
4. **No middleware auth enforcement** — auth is client-side only via `AuthProvider`; API routes are unprotected
5. **`refinement-system.ts` is unused** — only `planning-system.ts` is active
6. **Base64 images can bloat state** — no size limits or compression currently
7. **Share page under (app) group** — `/share/[id]` is in the `(app)` route group (has header) but doesn't strictly require auth; may want to move to its own group for cleaner UX

---

## Commands

```bash
npm run dev         # Start dev server (port 3000)
npm run build       # Production build
npx tsc --noEmit    # TypeScript type check
npm run lint        # ESLint
npm run type-check  # Alias for tsc --noEmit
```

---

## Deployment

### Vercel (Primary)
- **URL**: https://planner-ruby-seven.vercel.app/
- Auto-deploys from `main` branch on GitHub push
- Required env var: `NEXT_PUBLIC_GEMINI_API_KEY`
- Optional env vars: All `NEXT_PUBLIC_FIREBASE_*` keys (app works without them)

### Netlify (Optional)
- `netlify.toml` is included in repo with build config
- Uses `@netlify/plugin-nextjs` for Next.js support

### GitHub
- Repo: `https://github.com/benauyoung/Planner.git`
- Branch: `main`

---

## Documentation Index

| File | Purpose | Priority |
|------|---------|----------|
| `INTRO.md` | Agent onboarding — reading order, golden rules | Read first |
| `HANDOFF.md` | **This file** — complete codebase reference | Read second |
| `ARCHITECTURE.md` | Tech stack, data models, component tree, store API, key flows | Read third |
| `PLAN.md` | Implementation checklist — what's done, what's pending | Reference |
| `CONTRIBUTING.md` | Code style, naming, store patterns, git workflow | Reference |
| `ROADMAP.md` | Milestone tracking, version targets, change log | Reference |
| `VISION.md` | Product goals, target audience, design principles | Background |
| `README.md` | Quick project overview | Background |

---

## How to Continue Development

1. Read this `HANDOFF.md` for the full picture
2. Read `PLAN.md` → "Future Work" section for pending tasks
3. Check `types/project.ts` for the canonical data model
4. Check `stores/project-store.ts` for all available mutations
5. Run `npm run dev` and visit `http://localhost:3000` to see the landing page
6. Visit `/dashboard` to see the authenticated app

### Next Big Features (Post v1.0)
- **Production WebSocket backend** — Deploy PartyKit/Liveblocks for real-time multi-user collaboration
- **OAuth integration flows** — Server-side GitHub/Slack/Linear OAuth for production integration use
- **Territory file sync** — bidirectional canvas ↔ Markdown file sync
- **Advanced canvas** — spring physics (d3-force), multi-select, level-of-detail zoom
- **Image compression** — resize/compress base64 images to reduce state size
- **Hierarchy validation** — enforce valid type changes based on position in hierarchy

### Recent Changes (Feb 12, 2026)
- **Phase 1**: Command Palette + keyboard shortcuts (`Cmd+K`, `?` help overlay)
- **Phase 2**: Multiple views — List, Table, Board, Timeline, Sprints (6 total views)
- **Phase 3**: Assignees, priority, due dates, estimated hours, tags, team manager
- **Phase 4**: AI iteration loops — break down, audit, estimate, suggest dependencies
- **Phase 5**: Comments & activity feed on nodes
- **Phase 6**: Timeline / Gantt view with day grid, status bars, navigation
- **Phase 7**: Sprint planning — create sprints, drag backlog, progress bars
- **Phase 8**: AI smart suggestions — ambient project analysis with severity-ranked insights
- **Phase 9**: Version history — save/restore/delete named snapshots
- **Phase 10**: Embedded docs — Notion-style block editor (headings, code, checklists, callouts)
- **Phase 11**: Collaboration infrastructure — presence avatars, cursors, pluggable provider
- **Phase 12**: Integrations — GitHub, Slack, Linear service clients + settings UI

### Earlier Changes (Feb 11, 2026)
- **Landing page** — 8 new components in `components/landing/`, public route at `/`
- **Route restructure** — Next.js route groups: `(marketing)` for public, `(app)` for authenticated
- **Dashboard moved** to `/dashboard` (was `/`); all auth redirects updated
- **Firestore runtime failover** — `persistence.ts` catches Firestore errors and auto-falls back to localStorage
- **Animated dashboard loader** — branded loading screen replaces skeleton cards
