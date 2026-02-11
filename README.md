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

- **7 Node Types** — Goal, Subgoal, Feature, Task, Moodboard, Notes, Connector
- **AI Planning** — Gemini decomposes your idea into a structured hierarchy
- **AI Generation** — One-click PRD and implementation prompt generation for feature/subgoal nodes
- **Rich Nodes** — Attach images, rich text, PRDs, and IDE prompts to any node
- **Smart Mapping** — Auto-suggest parent nodes when creating new nodes on canvas
- **Manual Connections** — Drag edges between handles to set parent-child relationships
- **Context Menus** — Right-click nodes or empty canvas for quick actions
- **Dark Theme** — Near-black canvas with dashed bezier curve edges
- **Auto-Layout** — Dagre-powered hierarchical arrangement

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
│   ├── api/ai/                   # AI routes (chat, suggest-features, generate-prd, generate-prompt, generate-questions)
│   ├── project/[id]/page.tsx     # Project workspace (canvas + chat)
│   ├── project/new/page.tsx      # Onboarding questionnaire
│   ├── login/page.tsx            # Auth page
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Dashboard
├── components/
│   ├── canvas/                   # React Flow canvas
│   │   ├── graph-canvas.tsx      # Main canvas component
│   │   ├── canvas-toolbar.tsx    # Re-layout button
│   │   ├── context-menu/         # Node + pane context menus
│   │   └── nodes/                # 7 custom node components
│   ├── chat/                     # AI planning chat
│   ├── panels/                   # Detail panel, edit form, rich text editor
│   ├── onboarding/               # Project onboarding questionnaire
│   ├── dashboard/                # Project list, cards, empty state
│   ├── layout/                   # Header, theme toggle, user menu
│   └── ui/                       # Reusable UI primitives
├── stores/                       # Zustand state management
│   ├── project-store.ts          # Core project/node/edge state
│   ├── chat-store.ts             # AI chat history
│   └── ui-store.ts               # UI selections, panel state
├── services/                     # Firebase auth/firestore (guarded)
├── hooks/                        # Auto-layout, AI chat, project loading
├── lib/                          # Constants, utils, ID generation, context builder
├── prompts/                      # AI system prompts (planning, PRD, prompt generation)
├── types/                        # TypeScript interfaces
│   ├── project.ts                # PlanNode, NodePRD, NodePrompt, Project
│   ├── canvas.ts                 # FlowNode, FlowEdge, PlanNodeData
│   └── chat.ts                   # Chat message types
└── public/                       # Static assets (favicon)
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
|----------|---------|
| [VISION.md](./VISION.md) | North Star goals and target audience |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Technical decisions and data models |
| [PLAN.md](./PLAN.md) | Implementation status checklist |
| [ROADMAP.md](./ROADMAP.md) | Milestone tracking |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Coding standards |
| [HANDOFF.md](./HANDOFF.md) | Detailed codebase walkthrough |

---

## License

MIT © 2026 VisionPath
