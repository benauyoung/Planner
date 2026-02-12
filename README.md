# VisionPath

> **Visual, AI-powered project planning on an infinite canvas.** Describe your idea, get a DAG of goals, features, and tasks — then refine, connect, and execute.

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://typescriptlang.org/)
[![React Flow](https://img.shields.io/badge/React%20Flow-12.3-purple)](https://reactflow.dev/)

---

## What is VisionPath?

VisionPath is a **visual DAG-based project planning tool** where you:

1. **Describe** your project idea through a guided onboarding questionnaire
2. **Generate** a hierarchical plan via AI (Gemini 2.0 Flash)
3. **Visualize** the plan as an interactive node graph on an infinite canvas
4. **Refine** by chatting with AI, adding nodes, connecting edges, attaching PRDs & prompts
5. **Generate** PRDs and implementation prompts from node context with one click
6. **Execute** by tracking status, managing images/mood boards, and copying prompts into your IDE

### Key Features

- **12 Node Types** — Goal, Subgoal, Feature, Task, Moodboard, Notes, Connector, Spec, PRD, Schema, Prompt, Reference
- **7 Views** — Canvas, List, Table, Board (Kanban), Timeline (Gantt), Sprints, Pages (AI-generated UI previews)
- **AI Planning** — Gemini decomposes your idea into a structured hierarchy
- **AI Generation** — One-click PRD and implementation prompt generation
- **AI Iteration** — Break down, audit, estimate, suggest dependencies — accept/dismiss per suggestion
- **AI Smart Suggestions** — Ambient project analysis with severity-ranked insights
- **AI Page Generation** — Auto-scan project plan, generate full-fidelity Tailwind page previews on a zoomable canvas
- **Inline Page Chat** — Click any generated page, describe changes, AI regenerates the HTML
- **Command Palette** — `Cmd+K` fuzzy search with keyboard shortcuts for all actions
- **Rich Nodes** — Attach images, rich text, PRDs, IDE prompts, and Notion-style documents
- **Team Management** — Assign members, set priority, due dates, estimates, tags
- **Comments & Activity** — Threaded comments on nodes, project-level activity timeline
- **Sprint Planning** — Create sprints, drag tasks from backlog, progress tracking
- **Version History** — Save/restore named snapshots with branch support
- **Embedded Docs** — Notion-style block editor (headings, code, checklists, callouts, dividers)
- **Typed Edges** — `blocks`, `depends_on`, `informs`, `defines`, `implements`, `references`, `supersedes` with visual styles
- **Blast Radius** — Select a node to see all downstream-affected nodes highlighted
- **Export** — JSON, Markdown, `.cursorrules`, `CLAUDE.md`, `plan.md`, `tasks.md`
- **Import** — JSON projects, Markdown specs (paste or file upload with preview)
- **Shareable Plans** — Toggle public sharing, get a read-only URL for stakeholders
- **Template Library** — Pre-built plans (Auth System, CRUD API, Landing Page)
- **Integrations** — GitHub, Slack, Linear service clients + settings UI
- **Collaboration** — Presence avatars, live cursors, pluggable provider (local mock + Yjs-ready)
- **Dark Theme** — Near-black canvas with dashed bezier curve edges
- **Interactive Gantt** — Drag bars to move tasks, drag edges to resize durations
- **Unified Toolbar** — Project name, save status, view tabs, and actions in one compact bar
- **Auto-Layout** — Dagre-powered hierarchical arrangement with position preservation on updates
- **Page Previews** — 1280x800 desktop-sized iframes with Tailwind CDN, flow-grouped by navigation

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm
- Gemini API key ([get one here](https://aistudio.google.com/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/benauyoung/Planner.git
cd Planner

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your Gemini API key to .env.local
# NEXT_PUBLIC_GEMINI_API_KEY=your_key_here

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start planning.

---

## Project Structure

```
Planner/
├── app/                          # Next.js App Router pages
│   ├── api/ai/                   # AI routes (chat, iterate, analyze, generate-prd, etc.)
│   ├── (marketing)/              # Public landing page route group
│   ├── (app)/                    # Authenticated app route group
│   │   ├── dashboard/            # Project list dashboard
│   │   ├── login/                # Auth page
│   │   ├── project/[id]/         # Project workspace (canvas + views + chat)
│   │   ├── project/new/          # New project chooser
│   │   └── share/[id]/           # Read-only shared plan
│   └── layout.tsx                # Root layout
├── components/
│   ├── landing/                  # Public landing page (8 components)
│   ├── canvas/                   # React Flow canvas + nodes (7 types) + context menus
│   ├── views/                    # View switcher + List, Table, Board, Timeline, Pages views
│   ├── sprints/                  # Sprint board with drag-and-drop backlog
│   ├── ai/                       # AI suggestion panels (iteration + smart suggestions)
│   ├── comments/                 # Comment thread + activity feed
│   ├── editor/                   # Notion-style block editor
│   ├── versions/                 # Version history modal
│   ├── collaboration/            # Presence avatars + cursors
│   ├── integrations/             # GitHub/Slack/Linear settings UI
│   ├── chat/                     # AI planning chat
│   ├── panels/                   # Node detail panel (edit, PRDs, docs, comments)
│   ├── project/                  # Project workspace + team manager
│   ├── onboarding/               # Project onboarding + template gallery
│   ├── dashboard/                # Project list, cards, import buttons/modals
│   ├── share/                    # Share button + shared plan view
│   ├── layout/                   # Header, theme toggle, user menu
│   └── ui/                       # Command palette, shortcuts help, priority badge, assignee picker, tag input, etc.
├── stores/                       # Zustand state management
│   ├── project-store.ts          # 55+ mutations: nodes, edges, sprints, versions, team, comments
│   ├── chat-store.ts             # AI chat history
│   └── ui-store.ts               # View, theme, selected node, filters, pending edge
├── services/
│   ├── firebase.ts / firestore.ts / auth.ts  # Firebase (null-guarded)
│   ├── gemini.ts                 # Gemini client + schemas (chat, PRD, iteration, suggestion, pages)
│   ├── persistence.ts            # Firestore → localStorage failover
│   ├── collaboration.ts          # Pluggable collaboration provider
│   └── integrations/             # GitHub, Slack, Linear service clients
├── hooks/                        # AI chat, AI iterate, AI suggestions, collaboration, auto-layout
├── prompts/                      # AI system prompts (planning, PRD, iteration, suggestion, pages)
├── lib/                          # Constants, commands, export/import, blast radius, templates
├── types/
│   ├── project.ts                # PlanNode, ProjectPage, PageEdge, Sprint, ProjectVersion, etc.
│   ├── integrations.ts           # GitHub/Slack/Linear integration types
│   ├── canvas.ts                 # FlowNode, FlowEdge
│   └── chat.ts                   # ChatMessage, AIPlanNode
└── public/                       # Static assets
```

---

## Node Types

| Type | Purpose | Icon |
|------|---------|------|
| **Goal** | Top-level project objective | Target |
| **Subgoal** | Major milestone | Flag |
| **Feature** | Specific capability to build | Puzzle |
| **Task** | Atomic work item | CheckSquare |
| **Moodboard** | Image collection for visual reference | ImagePlus |
| **Notes** | Rich text content block | FileText |
| **Connector** | Compact status waypoint | Circle |
| **Spec** | Specification document | ScrollText |
| **PRD** | Product requirements document | ClipboardList |
| **Schema** | Data model / API contract | Braces |
| **Prompt** | AI/IDE prompt template | Terminal |
| **Reference** | External link / file reference | ExternalLink |

## Node Attachments

Every node can have:
- **PRDs** — Product requirement documents (title + monospaced content, copy-to-clipboard, AI-generated or manual)
- **Prompts** — IDE prompts (title + content, one-click copy for Cursor/VS Code, AI-generated or manual)
- **Images** — Drag-drop, file picker, clipboard paste, or URL (moodboard nodes)
- **Rich Text** — Tiptap editor content (notes nodes)

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 15.5.12 |
| Language | TypeScript | 5.x |
| Canvas | @xyflow/react | 12.3.2 |
| Layout | dagre | 0.8.5 |
| State | Zustand | 5.0.2 |
| AI | @google/generative-ai (Gemini) | 0.21.0 |
| Database | Firebase Firestore (optional) | 12.9.0 |
| Styling | Tailwind CSS | 3.4.1 |
| Animation | Framer Motion | 11.x |
| Icons | Lucide React | 0.462.0 |

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add `NEXT_PUBLIC_GEMINI_API_KEY` env var
4. Deploy — auto-deploys on every push to `main`

### Environment Variables

```env
# Required
NEXT_PUBLIC_GEMINI_API_KEY=<your-gemini-key>

# Optional (Firebase — app works without these)
NEXT_PUBLIC_FIREBASE_API_KEY=<key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<project>.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<id>
NEXT_PUBLIC_FIREBASE_APP_ID=<id>
```

---

## Documentation

| Document | Purpose |
|----------|--------|
| [INTRO.md](./INTRO.md) | AI agent onboarding — read this first |
| [HANDOFF.md](./HANDOFF.md) | Detailed codebase walkthrough |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Technical decisions and data models |
| [NEXT_FEATURES.md](./NEXT_FEATURES.md) | 12-phase feature plan (all complete) |
| [PLAN.md](./PLAN.md) | Implementation status checklist |
| [ROADMAP.md](./ROADMAP.md) | Milestone tracking |
| [VISION.md](./VISION.md) | North Star goals and target audience |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Coding standards |

---

## License

MIT 2026 VisionPath
