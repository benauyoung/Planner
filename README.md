# VisionPath

> **End spatial blindness in project planning.** A visual, infinite canvas where nodes represent your thoughts and connector cables represent your dependencies.

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://typescriptlang.org/)
[![React Flow](https://img.shields.io/badge/React%20Flow-12.3-purple)](https://reactflow.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## What is VisionPath?

VisionPath is a **visual DAG-based project planning tool** that combines:

- **Infinite Canvas** - Free-floating nodes with spring physics for organic clustering
- **AI-Powered Planning** - Gemini integration for task decomposition and implementation guidance
- **Bidirectional File Sync** - Changes on the canvas mirror to Markdown files and vice versa
- **Real-Time Collaboration** - Multiple users can plan together with CRDT-based conflict resolution

### The Problem

Developers suffer from "spatial blindness" - losing the big picture while staring at small details. Existing tools fail because:

1. **Isolation**: Planning happens in browsers, coding in IDEs - they never truly connect
2. **Rigidity**: Kanban columns and list views don't match organic, branching thought

### The Solution

VisionPath treats your project architecture as a visual map where:
- **Nodes** = Goals, Features, Tasks
- **Cables** = Dependencies between them
- **Drill-Down** = Click any node to reveal its plan and chat with an AI that knows exactly where it sits in the project

---

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Gemini API key ([get one here](https://aistudio.google.com/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/visionpath.git
cd visionpath

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Add your Gemini API key to .env.local
# NEXT_PUBLIC_GEMINI_API_KEY=your_key_here

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the canvas.

---

## Project Structure

```
visionpath/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (AI, file sync)
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main canvas page
├── components/
│   ├── canvas/            # React Flow canvas components
│   ├── nodes/             # Custom node types (Goal, Feature, Task)
│   ├── edges/             # Custom edge/cable components
│   └── panels/            # Drill-down panels (Plan, Chat, Details)
├── stores/                # Zustand state management
├── lib/                   # Utilities (AI, file sync, physics)
├── types/                 # TypeScript interfaces
├── territory/             # Mirrored Markdown documentation
│   ├── README.md
│   ├── VISION.md
│   ├── ARCHITECTURE.md
│   ├── SPEC_DEFS/
│   ├── PLAN.md
│   ├── CONTRIBUTING.md
│   ├── ROADMAP.md
│   └── LOGS/
└── docs/                  # Additional documentation
```

---

## Core Concepts

### Node Types

| Type | Purpose | Visual |
|------|---------|--------|
| **Goal** | Top-level objective | Large, primary color |
| **Subgoal** | Major milestone | Medium, secondary color |
| **Feature** | Specific capability | Standard, accent color |
| **Task** | Atomic work item | Small, muted color |

### Dependency Cables

Cables connect nodes to show dependencies. The system:
- Prevents circular dependencies
- Blocks downstream nodes until upstream completes
- Animates flow direction (left → right)

### Territory Sync

Every node maps to a Markdown file in `/territory`. Changes sync bidirectionally:
- Edit on canvas → File updates
- Edit file externally → Canvas updates

---

## Documentation

| Document | Purpose |
|----------|---------|
| [VISION.md](./VISION.md) | North Star goals and target audience |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Technical decisions and data flow |
| [PLAN.md](./PLAN.md) | Implementation checklist |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Coding standards and Git workflow |
| [ROADMAP.md](./ROADMAP.md) | Milestone tracking |

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Canvas**: React Flow (@xyflow/react)
- **Physics**: d3-force for spring simulation
- **State**: Zustand + Yjs (CRDT)
- **AI**: Google Gemini 2.0 Flash
- **Styling**: Tailwind CSS
- **Real-time**: PartyKit (WebSocket)
- **File Sync**: Chokidar

---

## License

MIT © 2025 VisionPath
