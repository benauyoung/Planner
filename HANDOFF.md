# TinyBaguette — Full AI Handoff Document

> Complete codebase reference. Updated March 11, 2026.

---

## What Is TinyBaguette?

TinyBaguette is an **AI-powered plan-to-product platform** built around three co-equal pillars. It is NOT just a PRD generator or a planning tool with extras — Plan, Design, and Agents are interconnected pillars that form a feedback loop.

### The Three Pillars

#### 1. PLAN (The DAG Canvas)
Users describe a project idea. AI builds a hierarchical directed acyclic graph (goals → subgoals → features → tasks) on an interactive canvas. Users refine through chat, answer AI-generated questions per node, and generate context-aware PRDs that know about each other. The plan is the backbone — but it is NOT the whole product.

- 12 node types: Goal, Subgoal, Feature, Task, Moodboard, Notes, Connector, Spec, PRD, Schema, Prompt, Reference
- 8 typed edge types: hierarchy, blocks, depends_on, informs, defines, implements, references, supersedes
- AI chat planning, AI iteration (break down, audit, estimate, suggest deps), AI smart suggestions
- Deep question flow per node with category-aware follow-ups and readiness badges
- Context-aware PRD generation — each PRD knows about parent/sibling/child/dependency PRDs
- PRD Pipeline panel with status tracking, stale detection, Ralphy export
- Multi-select + bulk actions (rubber-band, Shift+click, Ctrl+A, BulkActionsBar)
- Spring physics force-directed layout + Dagre tree layout toggle
- Level-of-detail zoom (full → compact → dot)
- Territory file sync: bidirectional canvas ↔ Markdown with diff review
- Blast radius analysis, smart mapping, command palette (Cmd+K)
- Team management, comments, activity feed, sprint planning, version history
- Embedded docs (Notion-style block editor), export/import (JSON, Markdown, .cursorrules, CLAUDE.md)
- Shareable plans via public read-only URL, template library (3 seed templates)

#### 2. DESIGN (Live Visual Builder)
AI generates actual working web pages (HTML + Tailwind CSS) from the project plan. These render as live `srcdoc` iframes — no WebContainer, no SharedArrayBuffer, works on all browsers. Two modes:

- **Canvas mode**: All pages visible on a zoomable React Flow canvas, connected by navigation edges — like a sitemap you can see and interact with all at once. Inline AI editing, delete, focus, select-to-chat on each page node.
- **Single-page mode**: Zoom into one page with viewport switcher (Desktop/Tablet/Mobile) and edit it inline via PageChat sidebar — type instructions, AI modifies the page live.

This is not a mockup tool. It generates real code. The design canvas is where users visualize their entire app as a set of connected pages before any code is written externally.

#### 3. AGENTS (Embeddable AI Chatbots)
Users build AI chatbot agents with custom persona, knowledge base, behavior rules, and theme. The key differentiator: **agents are dragged directly onto Design canvas pages** to embed them as floating chat widgets. So you plan your app, design your pages, then drop intelligent chatbots onto them — all without leaving TinyBaguette.

- Full agent builder: Config, Knowledge, Theme, Preview, Deploy tabs
- AI-assisted agent generation from description
- Live chat preview with Gemini backend
- One-click deploy with embed snippet
- Drag-and-drop onto Design canvas pages — injects styled chat widget HTML using agent's name, color, greeting, and position

### How They Connect

These three pillars are not separate features — they form a loop:

- **Plan → Design**: The DAG structure tells the design generator what pages to create and what they should contain.
- **Design → Plan**: Editing a page's content or structure can update the corresponding PRD and node details.
- **Agents → Design**: Agents are created in the Agents tab but deployed by dragging onto Design canvas pages, where their widget HTML is injected into the page code.
- **Plan → Export**: The interconnected PRDs, execution order, and project context export as packages for Claude Code, Cursor, Ralphy, or generic IDEs — so autonomous AI agents can build what was planned and designed.

### The Full User Journey

> Describe your idea → AI builds a visual plan → Refine with chat and questions → AI generates live page previews → Edit pages visually → Create AI chatbot agents → Drag agents onto pages → Generate interconnected PRDs → Export to your coding tool → Autonomous AI builds it.

Every part of this flow matters equally. When discussing features, priorities, or architecture, never treat Design or Agents as secondary to Plan.

### Common Mistakes to Avoid

- ❌ Calling TinyBaguette "a PRD generator" — it's a full plan-to-product platform
- ❌ Treating the Design tab as a nice-to-have — it's a core pillar where users see their app take shape
- ❌ Ignoring the Agent → Design integration — drag-and-drop agent embedding is a key differentiator
- ❌ Describing export as the only output — users can iterate visually in Design before they ever export
- ❌ Forgetting the feedback loop — Plan, Design, and Agents are interconnected, not siloed tabs

### Additional Capabilities

- **4 view tabs** (Plan, Design, Agents, Manage) with **6 Manage sub-views** (List, Table, Board, Timeline, Sprints, Backend)
- **Command palette** (Cmd+K) with fuzzy search + keyboard shortcuts
- **Collaboration infrastructure**: Presence avatars, live cursors, pluggable provider
- **Integrations**: GitHub, Slack, Linear settings UI (OAuth flows pending)

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
| AI (Planning) | @google/generative-ai (Gemini) | 0.21.0 |
| AI (Images) | openai (OpenAI gpt-image-1) | latest |
| Database | Firebase Firestore | 12.9.0 |
| Auth | Firebase Auth | 12.9.0 |
| Rich Text | @tiptap/react + starter-kit | 3.19.0 |
| Styling | Tailwind CSS | 3.4.1 |
| Animation | Framer Motion | 11.x |
| Icons | Lucide React | 0.462.0 |
| Markdown | react-markdown | 9.0.1 |
| WebContainer | @webcontainer/api | latest |
| Code Editor | @monaco-editor/react | latest |
| Zip Export | jszip | latest |
| Utilities | clsx, tailwind-merge | latest |

### NOT Installed (Planned but not in package.json)
- yjs / y-partykit (real-time collaboration) — not yet needed

---

## Environment Variables

```env
# Required
NEXT_PUBLIC_GEMINI_API_KEY=<Gemini API key>
NEXT_PUBLIC_OPENAI_API_KEY=<OpenAI API key — used for AI image generation>

# Optional (Firebase — app works without these, all guarded with null checks)
NEXT_PUBLIC_FIREBASE_API_KEY=<key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<project>.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<app-id>
```

**Note:** Firebase is fully optional. All Firebase services (`firebase.ts`, `firestore.ts`, `auth.ts`) are null-guarded — the app runs entirely with IndexedDB fallback when Firebase is not configured. Additionally, the persistence layer (`services/persistence.ts`) has a **runtime failover**: if Firestore is configured but unavailable at runtime (e.g. database not provisioned), all calls automatically fall back to IndexedDB after the first failure.

---

## Routing Architecture

TinyBaguette uses **Next.js Route Groups** to separate public marketing pages from authenticated application routes:

```
app/
├── layout.tsx                          # Root layout (html, body, Inter font, metadata ONLY)
├── globals.css                         # CSS variables, node colors, React Flow overrides
├── icon.png                            # App icon (logo.png)
│
├── (marketing)/                        # PUBLIC — no auth, own nav + footer
│   ├── layout.tsx                      # MarketingLayout: LandingNavBar + Footer
│   ├── page.tsx                        # Landing page (/ route) — features tabs, hero prompt, trust bar
│   ├── about/page.tsx                  # About TinyBaguette (company story + philosophy)
│   ├── contact/page.tsx                # Contact page (hello@tinybaguette.com mailto)
│   ├── privacy/page.tsx                # Privacy Policy (/privacy)
│   ├── terms/page.tsx                  # Terms of Service (/terms)
│   └── share/[id]/page.tsx            # Shared plan (/share/[id]) — read-only view
│
├── (app)/                              # AUTHENTICATED — auth-guarded, app header
│   ├── layout.tsx                      # AppLayout: AuthProvider + Header + ErrorBoundary
│   ├── dashboard/page.tsx              # Dashboard (/dashboard) — ProjectList
│   ├── login/page.tsx                  # Login (/login) — email/password
│   └── project/
│       ├── new/page.tsx                # New project (/project/new) — onboarding flow
│       └── [id]/page.tsx              # Existing project: ProjectWorkspace
│
├── api/ai/                             # AI API routes (server-side)
│   ├── chat/route.ts                   # POST — Gemini chat (progressive plan building)
│   ├── suggest-features/route.ts       # POST — AI feature suggestions for onboarding
│   ├── generate-prd/route.ts           # POST — AI PRD generation from node context
│   ├── generate-prompt/route.ts        # POST — AI prompt generation
│   ├── generate-questions/route.ts     # POST — AI question generation for nodes
│   ├── generate-pages/route.ts         # POST — AI page preview generation from project plan
│   ├── edit-page/route.ts              # POST — AI page HTML editing from user instruction
│   ├── generate-image/route.ts         # POST — AI image generation via OpenAI gpt-image-1 (returns base64 data URL)
│   ├── generate-app/route.ts           # POST — AI generates multi-file React+Tailwind app from project context
│   ├── edit-app/route.ts               # POST — AI edits existing app files from user instruction
│   ├── generate-followups/route.ts     # POST — AI generates follow-up questions based on previous Q&A
│   ├── refine/route.ts                 # POST — AI plan refinement
│   ├── generate-backend/route.ts       # POST — AI backend module generation
│   └── edit-backend/route.ts           # POST — AI backend module editing
├── api/agent/                          # Agent API routes
│   ├── generate/route.ts               # POST — AI generates agent config from description
│   └── [agentId]/chat/route.ts         # POST — Agent chat (loads config, proxies to Gemini)
└── api/waitlist/
    └── route.ts                        # POST — Email waitlist capture → Firestore + optional Resend welcome
```

### Route Summary

| URL | Route Group | Auth Required | Description |
|-----|-------------|---------------|-------------|
| `/` | `(marketing)` | No | Public landing page |
| `/about` | `(marketing)` | No | About TinyBaguette |
| `/contact` | `(marketing)` | No | Contact page (hello@tinybaguette.com) |
| `/privacy` | `(marketing)` | No | Privacy Policy |
| `/terms` | `(marketing)` | No | Terms of Service |
| `/share/[id]` | `(marketing)` | No | Read-only shared plan view |
| `/login` | `(app)` | No (redirects to /dashboard if authed) | Login page (email/password) |
| `/dashboard` | `(app)` | Yes | Project list dashboard |
| `/project/new` | `(app)` | Yes | New project creation |
| `/project/[id]` | `(app)` | Yes | Project canvas workspace |
| `/api/waitlist` | `api/` | No | POST — Email waitlist capture |

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
│   ├── icon.png                        # App icon (logo.png)
│   ├── (marketing)/
│   │   ├── layout.tsx                  # LandingNavBar + Footer wrapper
│   │   ├── page.tsx                    # Landing page sections assembly
│   │   ├── about/page.tsx              # About TinyBaguette (company story + philosophy)
│   │   ├── contact/page.tsx            # Contact page (hello@tinybaguette.com mailto)
│   │   ├── privacy/page.tsx            # Privacy Policy (/privacy)
│   │   ├── terms/page.tsx              # Terms of Service (/terms)
│   │   └── share/[id]/page.tsx         # Read-only shared plan (/share/[id])
│   ├── (app)/
│   │   ├── layout.tsx                  # AuthProvider + Header + ErrorBoundary
│   │   ├── dashboard/page.tsx          # ProjectList dashboard
│   │   ├── login/page.tsx              # Firebase auth (email/password)
│   │   └── project/
│   │       ├── new/page.tsx            # New project: Onboarding → Chat + Canvas
│   │       └── [id]/page.tsx           # Existing project: ProjectWorkspace
│   ├── api/ai/
│   │   ├── chat/route.ts               # POST — Gemini chat
│   │   ├── suggest-features/route.ts   # POST — AI feature suggestions
│   │   ├── generate-prd/route.ts       # POST — AI PRD generation
│   │   ├── generate-prompt/route.ts    # POST — AI prompt generation
│   │   ├── generate-questions/route.ts # POST — AI question generation
│   │   ├── iterate/route.ts            # POST — AI iteration (break down, audit, estimate)
│   │   ├── analyze/route.ts            # POST — AI smart suggestions analysis
│   │   ├── generate-pages/route.ts     # POST — AI page preview generation
│   │   ├── edit-page/route.ts          # POST — AI page HTML editing
│   │   ├── generate-image/route.ts    # POST — AI image generation (OpenAI gpt-image-1)
│   │   ├── refine/route.ts             # POST — AI plan refinement
│   │   ├── generate-backend/route.ts   # POST — AI backend module generation
│   │   └── edit-backend/route.ts       # POST — AI backend module editing
│   └── api/agent/
│       ├── generate/route.ts           # POST — AI generates agent config from description
│       └── [agentId]/chat/route.ts     # POST — Agent chat (loads config, proxies to Gemini)
├── components/
│   ├── landing/                        # Landing page components (public)
│   │   ├── nav-bar.tsx                 # Sticky nav, transparent → blur on scroll, mobile menu
│   │   ├── hero-prompt.tsx             # AI-powered prompt → page preview generator with email capture gate
│   │   ├── hero-mockup.tsx             # SVG/CSS animated canvas mockup (nodes + edges)
│   │   ├── trust-bar.tsx               # Social proof badges (Station 8, Pioneers VC)
│   │   ├── how-it-works.tsx            # 3-step workflow (Describe → Generate → Refine)
│   │   ├── features-tabs.tsx           # Interactive tabbed demo: Planning, Design, Agents, Integrations
│   │   ├── features-grid.tsx           # 6-card feature showcase
│   │   ├── cta-banner.tsx              # Full-width gradient CTA section
│   │   └── footer.tsx                  # 4-column footer with links + social icons
│   ├── canvas/
│   │   ├── graph-canvas.tsx            # React Flow canvas (blast radius, typed edges, multi-select, spring layout)
│   │   ├── canvas-toolbar.tsx          # Export dropdown, blast radius toggle, undo/redo, dagre/spring layout toggle, territory sync toggle
│   │   ├── bulk-actions-bar.tsx        # Floating toolbar for multi-select: status, align, distribute, duplicate, delete
│   │   ├── territory-sync-panel.tsx   # Territory sync UI: export/import, diff review, per-node accept/reject
│   │   ├── nodes/
│   │   │   ├── base-plan-node.tsx      # Shared node with LOD rendering (full/compact/dot)
│   │   │   ├── goal-node.tsx           # Goal wrapper
│   │   │   ├── subgoal-node.tsx        # Subgoal wrapper
│   │   │   ├── feature-node.tsx        # Feature wrapper
│   │   │   ├── task-node.tsx           # Task wrapper
│   │   │   ├── moodboard-node.tsx      # Image grid node
│   │   │   ├── notes-node.tsx          # Rich text node
│   │   │   ├── connector-node.tsx      # Compact status waypoint
│   │   │   ├── node-toolbar.tsx        # Hover toolbar (edit, status, collapse, add child)
│   │   │   └── node-types.ts           # nodeTypes registry (12 types)
│   │   └── context-menu/
│   │       ├── node-context-menu.tsx   # Right-click node (+ dependency edge creation)
│   │       ├── pane-context-menu.tsx   # Right-click canvas (add node + smart mapping)
│   │       └── context-submenu.tsx     # Flyout submenu helper
│   ├── views/                          # Multiple view components
│   │   ├── list-view.tsx               # Hierarchical tree with expand/collapse
│   │   ├── table-view.tsx              # Sortable/filterable grid with priority + assignee columns
│   │   ├── board-view.tsx              # Kanban by status with drag-and-drop
│   │   ├── timeline-view.tsx           # Interactive Gantt: drag-to-move, edge-resize, day grid
│   │   ├── design-view.tsx             # Design tab: srcdoc iframe previews, AI page generation, PageChat sidebar, single/canvas modes, agent drop handler
│   │   ├── design-canvas.tsx           # React Flow canvas for Design tab: PageFrameNode (srcdoc iframes), AgentsPanel (drag-and-drop), inline AI edit bar
│   │   ├── pages-view.tsx              # AI-generated page previews on zoomable canvas with inline chat (legacy, unused)
│   │   ├── backend-view.tsx            # Backend module architect on zoomable canvas
│   │   └── agents-view.tsx             # Agent builder: config, knowledge, theme, preview, deploy tabs
│   ├── sprints/
│   │   └── sprint-board.tsx            # Sprint overview: create, drag backlog, progress bars
│   ├── panels/
│   │   ├── node-detail-panel.tsx       # Detail panel: edit, questions (category-aware, follow-ups, readiness), PRDs (stale indicator), prompts, images, children
│   │   ├── prd-pipeline-panel.tsx      # PRD Pipeline panel: status tracking, filter tabs, Ralphy ZIP export
│   │   ├── node-edit-form.tsx          # Title + description inline edit
│   │   └── rich-text-editor.tsx        # Tiptap rich text editor
│   ├── ai/
│   │   ├── ai-suggestions-panel.tsx    # AI iteration suggestions (accept/dismiss per suggestion)
│   │   └── smart-suggestions-panel.tsx # Ambient AI analysis with severity-ranked insights
│   ├── comments/
│   │   └── comment-thread.tsx          # Comment thread with add/delete
│   ├── editor/
│   │   └── block-editor.tsx            # Notion-style block editor (headings, code, checklists, callouts)
│   ├── versions/
│   │   └── version-history.tsx         # Save/restore/delete version snapshots
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
│   ├── share/
│   │   ├── share-button.tsx            # Share popover (public/private toggle, copy link)
│   │   └── shared-plan-view.tsx        # Read-only canvas for shared plans
│   ├── project/
│   │   ├── project-workspace.tsx       # Canvas + views + chat + panels + modals
│   │   ├── project-toolbar.tsx         # Unified toolbar: back, title, save status, view tabs, actions
│   │   └── team-manager.tsx            # Modal to add/remove team members
│   ├── layout/
│   │   ├── header.tsx                  # App header (Compass icon + TinyBaguette → /dashboard)
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
│   ├── use-agent-chat.ts              # Agent chat preview hook (send messages, manage state)
│   ├── use-webcontainer.ts            # WebContainer lifecycle hook (boot, writeAppFiles, restart)
│   ├── use-auto-layout.ts             # Dagre layout algorithm
│   ├── use-zoom-level.ts              # LOD tier hook (full/compact/dot) from ReactFlow viewport zoom
│   ├── use-territory-sync.ts          # Territory sync hook (export/import/diff/merge lifecycle)
│   └── use-project.ts                 # Persistence load/save with 2s debounce (saves all project fields)
├── stores/
│   ├── project-store.ts               # Central state: project, nodes, edges, sprints, versions, 57+ mutations (incl. deleteNodes, duplicateNodes)
│   ├── chat-store.ts                  # Chat messages, phase, onboarding answers
│   └── ui-store.ts                    # Theme, selected node, multi-select, view, filters, pending edge, layout mode, territory sync
├── services/
│   ├── firebase.ts                    # Firebase init (null-guarded)
│   ├── firestore.ts                   # CRUD (null-guarded)
│   ├── auth.ts                        # Auth functions (null-guarded)
│   ├── gemini.ts                      # Gemini client + response schemas (chat, PRD, prompt, iteration, suggestion, pages, agent, app generation, app edit, follow-up questions)
│   ├── webcontainer.ts                # Singleton WebContainer boot, file ops (ensureDir), dev server, event emitter
│   ├── persistence.ts                 # Persistence abstraction: Firestore → IndexedDB failover
│   ├── local-storage.ts              # IndexedDB backend for offline persistence (migrated from localStorage; handles large base64 images)
│   └── collaboration.ts               # Collaboration provider abstraction (pluggable, local mock)
├── prompts/
│   ├── planning-system.ts             # Main AI system prompt
│   ├── prd-generation.ts              # PRD generation system prompt
│   ├── prompt-generation.ts           # Implementation prompt generation system prompt
│   ├── question-generation.ts         # AI question generation system prompt
│   ├── iteration-system.ts            # AI iteration actions system prompt
│   ├── suggestion-system.ts           # Ambient AI analysis system prompt
│   ├── page-generation.ts             # AI page preview generation system prompt
│   ├── app-generation.ts              # AI multi-file React+Tailwind app generation system prompt (legacy)
│   ├── app-edit.ts                    # AI app editing system prompt (legacy)
│   ├── follow-up-generation.ts        # AI follow-up question generation system prompt
│   ├── agent-generation.ts            # Agent config generation system prompt
│   └── refinement-system.ts           # Refinement prompt (unused)
├── lib/
│   ├── constants.ts                   # NODE_CONFIG (12 types), NODE_CHILD_TYPE, DAGRE_CONFIG
│   ├── commands.ts                    # Command palette command definitions
│   ├── node-context.ts                # buildNodeContext() — hierarchy context for AI generation
│   ├── export-import.ts               # JSON export/import with download/read helpers
│   ├── export-markdown.ts             # Subtree + full plan markdown export
│   ├── export-project-files.ts        # .cursorrules, CLAUDE.md, plan.md, tasks.md generators
│   ├── import-markdown.ts             # Markdown spec parser (headings, checklists, frontmatter)
│   ├── blast-radius.ts                # Downstream impact analysis (getBlastRadius)
│   ├── canvas-align.ts                # Multi-select alignment helpers (alignTop/Middle/Bottom/Left/Center/Right, distributeH/V)
│   ├── canvas-physics.ts              # Force-directed spring layout engine (repulsion, attraction, hierarchy gravity, damping)
│   ├── territory-serialize.ts         # Project ↔ .territory file tree serializer (YAML frontmatter + markdown, zero deps)
│   ├── territory-sync.ts             # Territory diff engine, merge logic, conflict detection
│   ├── webcontainer-template.ts       # Vite + React 18 + Tailwind v4 + React Router scaffold (FileSystemTree)
│   ├── build-app-context.ts           # Gathers project nodes, PRDs, Q&A into AI prompt context
│   ├── element-selector-script.ts     # Injected into WebContainer iframe for visual click-to-edit
│   ├── export-ralphy.ts               # Ralphy ZIP export (prd/*.md, .ralphy/config.yaml, PRD.md)
│   ├── prd-status.ts                  # PRD status tracking (needs_questions → answering → ready → generated → stale → export_ready)
│   ├── templates/                     # Seed plan templates
│   │   ├── index.ts                   # Template registry (3 templates)
│   │   ├── auth-system.ts             # SaaS Authentication System (24 nodes)
│   │   ├── crud-api.ts                # REST API with CRUD (22 nodes)
│   │   └── landing-page.ts            # Marketing Landing Page (20 nodes)
│   ├── feature-suggestions.ts         # AI feature suggestion schema
│   ├── onboarding-config.ts           # Onboarding step definitions
│   ├── onboarding-message.ts          # Formats answers into AI prompt
│   ├── auth-fetch.ts                  # Sends Firebase ID token in Authorization header for /api/* requests
│   ├── pokopia-vibe.ts                # Pokopia kawaii design style prompt (soft pastels, rounded-3xl, colored shadows, sticker-style cards)
│   ├── inject-images.ts               # Image injection pipeline: extractImagePlaceholders(), injectGeneratedImages(), sanitizeImageSrcs(), stripBase64Images()
│   ├── canvas-physics-animated.ts     # Animated spring simulation with rAF loop, pin/unpin
│   ├── id.ts                          # generateId() — crypto.randomUUID
│   └── utils.ts                       # cn() — clsx + tailwind-merge
├── types/
│   ├── project.ts                     # PlanNode, ProjectPage, PageEdge, ProjectEdge, Sprint, ProjectVersion, Agent, AppFile, AppChatMessage, etc.
│   ├── agent.ts                       # Agent, AgentKnowledgeEntry, AgentAction, AgentBehaviorRule, AgentTheme
│   ├── integrations.ts               # GitHub/Slack/Linear integration types
│   ├── canvas.ts                      # FlowNode, FlowEdge, PlanNodeData
│   └── chat.ts                        # ChatMessage, AIPlanNode
├── contexts/
│   └── auth-context.tsx               # Firebase auth context provider
├── public/
│   ├── logo.png                       # App logo / favicon (referenced in layout.tsx metadata)
│   └── favicon.svg                    # Legacy SVG favicon
├── middleware.ts                      # Next.js middleware: enforces Authorization header on /api/* routes when Firebase is configured
├── netlify.toml                       # Netlify deploy config (optional, Vercel is primary)
├── next.config.js                     # Next.js config (reactStrictMode: true, COOP/COEP headers for WebContainer)
├── tailwind.config.ts                 # Tailwind with custom node-type color tokens
├── tsconfig.json                      # TypeScript config with path aliases
└── package.json                       # Dependencies and scripts
```

---

## Data Model

### PlanNode (12 types)
```typescript
type NodeType =
  | 'goal' | 'subgoal' | 'feature' | 'task'
  | 'moodboard' | 'notes' | 'connector'
  | 'spec' | 'prd' | 'schema' | 'prompt' | 'reference'
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
  version?: string            // Document version (spec/prd nodes)
  schemaType?: 'data_model' | 'api_contract' | 'database' | 'other'
  promptType?: 'implementation' | 'refactor' | 'test' | 'review'
  targetTool?: 'cursor' | 'windsurf' | 'claude' | 'generic'
  referenceType?: 'link' | 'file' | 'image'
  url?: string                // External URL (reference nodes)
  acceptanceCriteria?: string[] // PRD acceptance criteria
}
```

### ProjectEdge (Typed Dependencies)
```typescript
type EdgeType =
  | 'hierarchy' | 'blocks' | 'depends_on'
  | 'informs' | 'defines' | 'implements' | 'references' | 'supersedes'

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
  pages?: ProjectPage[]       // AI-generated page previews
  pageEdges?: PageEdge[]      // Navigation flow between pages
  backendModules?: BackendModule[]  // AI-generated backend architecture modules
  backendEdges?: BackendEdge[]      // Connections between backend modules
  agents?: Agent[]             // Embeddable AI chatbot agents
  appFiles?: AppFile[]           // WebContainer-generated React app files
  appDesignSummary?: string      // AI summary of generated app
  appChatMessages?: AppChatMessage[]  // Design tab chat history
}
```

### Backend Architecture Types
```typescript
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
```

### Agent (Embeddable AI Chatbot)
```typescript
interface Agent {
  id: string
  name: string
  description: string
  systemPrompt: string
  greeting: string
  knowledge: AgentKnowledgeEntry[]  // FAQ/text entries the agent can reference
  actions: AgentAction[]            // Callable actions (e.g. redirect, collect email)
  rules: AgentBehaviorRule[]        // Behavior constraints (e.g. "never share pricing")
  theme: AgentTheme                 // Widget colors, position, avatar
  isPublished: boolean
  createdAt: number
  updatedAt: number
}
interface AgentKnowledgeEntry { id, type: 'faq'|'text', title, content }
interface AgentAction { id, type: 'redirect'|'collect_email'|'escalate'|'custom', label, config }
interface AgentBehaviorRule { id, rule: string }
interface AgentTheme { primaryColor, backgroundColor, fontFamily, position: 'bottom-right'|'bottom-left', avatarUrl? }
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
interface ProjectPage { id, title, route, html, linkedNodeIds, position: { x, y } }
interface PageEdge { id, source, target, label? }
interface AppFile { path: string, content: string }
interface AppChatMessage { id, role: 'user'|'ai', content, filesChanged?: string[], timestamp }
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

**Node CRUD**: `addChildNode`, `addFreeNode`, `deleteNode`, `deleteNodes`, `duplicateNode`, `duplicateNodes`, `changeNodeType`, `toggleNodeCollapse`, `updateNodeContent`, `updateNodeStatus`

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

**Documents**: `updateNodeDocument`, `updateNodeVersion`, `updateNodeSchemaType`, `updateNodePromptType`, `updateNodeTargetTool`, `updateNodeReferenceType`, `updateNodeUrl`, `updateNodeAcceptanceCriteria`

**Project**: `updateProjectTitle`

**Sharing**: `toggleShareProject`

**Flow State**: `setFlowNodes`, `setFlowEdges`

**Territory Sync**: `mergeFromTerritory`

**Undo/Redo**: `undo`, `redo` (with `canUndo`, `canRedo` state)

**Pages**: `setPages`, `updatePageHtml`, `updatePagePosition`, `addPageEdge`, `removePageEdge`, `removePage`

**Backend**: `setBackendModules`, `updateBackendModule`, `updateBackendModulePosition`, `removeBackendModule`, `addBackendEdge`, `removeBackendEdge`

**App Files (Design Tab)**: `setAppFiles`, `updateAppFile`, `addAppChatMessage`, `clearAppChatMessages`

**PRDs**: `addNodePRD` (with `referencedPrdIds`), `updateNodePRD` (propagates staleness to dependents), `removeNodePRD`

**Agents**: `addAgent`, `updateAgent`, `removeAgent`, `addAgentKnowledge`, `removeAgentKnowledge`, `addAgentRule`, `removeAgentRule`, `updateAgentTheme`, `toggleAgentPublished`

**Flow Conversion**: `planNodesToFlow(nodes, projectEdges, existingFlowNodes?)` — converts PlanNode[] + ProjectEdge[] → FlowNode[] + FlowEdge[], preserves existing positions

---

## Application Flows

### Landing Page → Email Capture → Login → Dashboard
```
/ (Landing Page — public)
  → All CTA buttons scroll to #hero-prompt section
  → User types project idea → AI generates page previews
  → "Continue Building" → email capture modal
  → "Login" nav link → /login
  → User signs in (email/password)
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
- **Rubber-band select** → Drag on empty canvas to multi-select nodes; Shift+click to toggle
- **Bulk actions bar** → Appears when 2+ nodes selected: set status, align, distribute, duplicate, delete
- **Re-layout button** → Dagre (tree) or Spring (force-directed) auto-layout
- **Territory sync button** → Export/import project as `.territory/` Markdown files with diff review
- **Blast radius toggle** → Dims unaffected nodes when a node is selected
- **Export dropdown** → JSON, Markdown, .cursorrules, CLAUDE.md, plan.md, tasks.md
- **Share button** → Public/private toggle with shareable URL
- **Cmd+K** → Command palette with fuzzy search
- **View tabs** → Plan / Design / Agents / Manage (with List, Table, Board, Timeline, Sprints, Backend sub-views)
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
  └── Fallback: services/local-storage.ts (IndexedDB)
              └── Auto-migrates legacy localStorage data on module load
```

The `withFallback()` wrapper in `persistence.ts` handles three scenarios:
1. **Firebase not configured** (no env vars) → uses IndexedDB from the start
2. **Firebase configured and working** → uses Firestore
3. **Firebase configured but unavailable** (e.g. database not provisioned) → tries Firestore on first call, catches error, logs one warning, permanently falls back to IndexedDB for all subsequent calls

**IndexedDB** (`services/local-storage.ts`): Uses `indexedDB.open('tinybaguette', 1)` with a 'projects' object store. Replaced localStorage to handle large base64 image data without hitting the 5MB quota limit. Auto-migrates existing data from the legacy `tinybaguette_projects` localStorage key on module load.

Auto-save runs via `use-project.ts` with a 2-second debounce. It now saves all project fields (not just title/description/phase/nodes/edges).

---

## Landing Page Architecture

The landing page lives in the `(marketing)` route group at `/` and is fully public (no auth wrapper).

### Sections (top to bottom)
1. **Nav Bar** (`nav-bar.tsx`) — Sticky, transparent → blurred on scroll, logo.png + "TinyBaguette" brand, links to Features / Login, "Get Started" CTA → scrolls to `#hero-prompt`, mobile hamburger menu
2. **Features Tabs** (`features-tabs.tsx`) — Section header: "Big Ideas. TinyBaguette." + subtitle. Interactive tabbed demo with 4 tabs (shown first on page), demo area constrained to 75% width:
   - **Planning Demo** — AI chat sidebar with progressive conversation that builds a node graph step-by-step (Music Festival App theme). Messages auto-play and nodes appear in sync.
   - **Design Demo** — 6 mini-webpage previews (Home, Lineup, Map, Tickets, Profile, Feed) on a canvas with dashed bezier connection lines and arrow markers. AI chat overlay auto-plays two actions: (1) changes accent color to pink across all pages with smooth CSS transitions, (2) adds a concert hero image to the Lineup page.
   - **Agents Demo** — Animated bot builder: types bot name + greeting character-by-character, shows knowledge entries, deploys with progress bar, then a floating chat widget appears on a mock website (vibefest.com) with live conversation. All timings slowed 25% for readability.
   - **Integrations Demo** — Supabase and GitHub cards auto-connect with spinner → green checkmark animation. Each integration syncs 4 features with progressive checkmarks. Right panel shows live sync activity feed with timestamped entries.
   - "Try It Free" CTA → scrolls to `#hero-prompt`
3. **Hero Prompt** (`hero-prompt.tsx`) — `id="hero-prompt"`. 4-phase flow:
   - **Input phase**: Animated prompt input with rotating placeholder ideas and clickable example chips
   - **Loading phase**: Conic-gradient spinning border around Sparkles icon, step messages ("Analyzing...", "Designing pages...", etc.)
   - **Preview phase**: 3 premium page preview cards derived from AI plan nodes. Dark glassmorphism aesthetic (`bg-[#0c0c0f]`), macOS browser chrome with traffic lights, 3 distinct layouts (hero with gradient CTA + stats, dashboard with animated bar chart, feed with social cards). Animated gradient glows, spring animations, staggered reveals. "Continue Building →" button.
   - **Email phase**: Modal overlay with email input, validation, success confirmation, "Build another project" reset
4. **Trust Bar** (`trust-bar.tsx`) — Horizontal strip: "Station 8 Developed", "Pioneers VC Approved" with Shield + Award icons
5. **Footer** (`footer.tsx`) — 4-column footer: Product (Features, How It Works, Templates → #hero-prompt), Company (About → /about, Contact → /contact), Legal (Privacy, Terms). Blog link removed. Social icons (GitHub, Twitter)

### Additional Marketing Pages
- **`/about`** — Company story ("Nobody actually likes Jira..."), philosophy ("Less bloat. More bread. Just keep shipping.")
- **`/contact`** — Centered Mail icon + `mailto:hello@tinybaguette.com` button

### CTA Button Routing
All CTA buttons on the landing page scroll to `#hero-prompt` instead of linking to `/login`:
- "Get Started" (nav-bar desktop + mobile) → `#hero-prompt`
- "Get Started for Free" (hero-section, cta-banner) → `#hero-prompt`
- "Try It Free" (features-tabs) → `#hero-prompt`
- Only the "Login" text link in the nav still goes to `/login`

---

## Dashboard Loading Screen

When the user lands on `/dashboard` after login, `DashboardLoader` (`components/dashboard/dashboard-loader.tsx`) shows an animated loading screen while projects are fetched:

- **Floating node rectangles** in the background using real node-type CSS color variables, with Framer Motion float + scale animations
- **Dashed connection lines** (SVG) that draw in progressively
- **Spinning compass icon** (the TinyBaguette brand icon) with a primary glow halo
- **"Loading your workspace"** text with three pulsing dots

This replaces the old skeleton card placeholders for a more branded experience.

---

## Key Patterns

1. **Route groups** — `(marketing)` for public pages, `(app)` for authenticated pages; root layout is minimal (html/body/fonts only)
2. **All shared state in Zustand** — component-local state only for UI
3. **`planNodesToFlow(nodes, edges)`** — always called after node mutations to sync React Flow (hierarchy + typed edges)
4. **Dagre for layout** — `useAutoLayout` hook, LR direction (left-to-right), triggered on node count change
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
3. ~~**`changeNodeType` has no hierarchy validation**~~ — Fixed: validates parent + children compatibility before allowing type change
4. ~~**`refinement-system.ts` is unused**~~ — Actually used by `planning-chat.tsx` and `refinement-question-card.tsx`
5. ~~**Base64 images can bloat state**~~ — Fixed: images > 5MB rejected, > 1MB auto-compressed
6. ~~**WebContainer requires COOP/COEP headers**~~ — No longer relevant. The Design tab was rewritten to use srcdoc iframes (no WebContainer). COOP/COEP headers are still set in `next.config.js` but are no longer needed by the active codebase. They can be safely removed.
7. **Legacy WebContainer files still in codebase** — `services/webcontainer.ts`, `hooks/use-webcontainer.ts`, `lib/webcontainer-template.ts`, `lib/build-app-context.ts`, `lib/element-selector-script.ts`, `lib/parse-app-routes.ts`, `prompts/app-generation.ts`, `prompts/app-edit.ts`, and their API routes (`/api/ai/generate-app`, `/api/ai/edit-app`) are still present but unused by the current Design tab. Dependencies `@webcontainer/api`, `@monaco-editor/react`, `jszip` are still in `package.json`. All can be removed in a future cleanup pass.

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
- Required env vars: `NEXT_PUBLIC_GEMINI_API_KEY`, `NEXT_PUBLIC_OPENAI_API_KEY`
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
| `archive/NEXT_FEATURES.md` | 12-phase feature plan (archived — superseded by ROADMAP.md) | Archived |
| `archive/SPEC_DEFS/*.md` | Feature specs (archived — all implemented) | Archived |

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

### Recent Changes (March 11, 2026 — Session 7)

**Pokopia Vibe + AI Image Generation (v0.9.13):**
- **Pokopia kawaii design style** (`lib/pokopia-vibe.ts`) — Wraps page generation and edit-page prompts with a Pokopia aesthetic: soft pastels, rounded-3xl, colored shadows, sticker-style cards, pill buttons, warm cozy mood. Easily removable (delete the file + strip 2 imports from `prompts/page-generation.ts` and `app/api/ai/edit-page/route.ts`).
- **AI image generation** (`app/api/ai/generate-image/route.ts`) — Uses OpenAI `gpt-image-1` model (1024x1024, quality: 'low'). Returns base64 PNG data URL. Auth not required (public route for server-side self-calls).
- **Image injection pipeline** (`lib/inject-images.ts`):
  - `extractImagePlaceholders(html)` — Finds all `<img data-generate="...">` tags
  - `injectGeneratedImages(html, baseUrl)` — Replaces placeholders with base64 data URLs (concurrent, max 3, max 5/page, 60s timeout)
  - `sanitizeImageSrcs(html)` — Catches external image URLs that AI outputs and converts to data-generate placeholders
  - `stripBase64Images(html)` — Removes base64 data before sending HTML to AI (prevents token overflow)
  - `POKOPIA_IMAGE_PLACEHOLDER_CSS` — Shimmer animation for loading placeholders
- **Server-side injection**: `generate-pages` route runs `sanitizeImageSrcs()` then `injectGeneratedImages()` after Gemini returns
- **Client-side progressive injection**: `design-view.tsx` runs `sanitizeImageSrcs()` and `injectGeneratedImages()` after edit-page streaming completes, with shimmer placeholders shown during loading
- **Image convention**: AI outputs `<img src="/api/placeholder" data-generate="[vivid description]">` tags; pipeline replaces with base64 data URLs

**IndexedDB Storage Migration:**
- `services/local-storage.ts` rewritten from localStorage to IndexedDB (`indexedDB.open('tinybaguette', 1)`)
- Solves localStorage 5MB quota exceeded errors caused by large base64 images (multiple pages x 2-4 images x 500KB-2MB each)
- Auto-migrates existing data from legacy `tinybaguette_projects` localStorage key on module load
- All CRUD operations use IndexedDB transactions

### Earlier Changes (Feb 20-22, 2026 — Sessions 4-6)

**Design Tab Complete Rewrite (replaced WebContainer with srcdoc iframes):**
- **Why**: WebContainer required SharedArrayBuffer + COOP/COEP headers that fail on most deployed hosts (Vercel, Netlify). The new approach uses `/api/ai/generate-pages` to generate standalone HTML with Tailwind CSS, rendered via `srcdoc` iframes — works everywhere.
- **`components/views/design-view.tsx`** (~808 lines) — Complete rewrite. Removed: WebContainer, `useWebContainer` hook, boot/install/start phases, `AppChat` (old), `FileTree`, `ElementInspector`, `CodeEditorPanel`, `MonacoEditor`, `parseAppRoutes`. Added: `handleGenerate` calls `/api/ai/generate-pages`, `PageChat` sidebar using `/api/ai/edit-page`, `handleDropAgent` for agent widget injection, `handleDeletePage`, `handleEditPageOnCanvas`, `handleAddPage`. Two modes: `designMode: 'single' | 'canvas'` (default: canvas). `wrapHtmlPage()` wraps body HTML in full document with Tailwind CDN.
- **`components/views/design-canvas.tsx`** (~429 lines) — Rewritten to accept `ProjectPage[]` + `PageEdge[]` + `Agent[]`. `PageFrameNode` renders srcdoc iframe (1280×800 scaled to 420×320). `AgentsPanel` — collapsible floating panel (top-left) with draggable agent cards. Drag-over green ring highlight on page nodes. Drop handler calls `onDropAgent(pageId, agentId)`.

**Canvas Page Interactions (6 commits):**
1. **Inline AI editing** (`e07dcb0`) — Each `PageFrameNode` has a MessageSquare button → opens inline edit bar → type instruction → AI edits that page via `/api/ai/edit-page`
2. **Delete page** (`e07dcb0`) — Trash2 button on each canvas node, wired to `removePage` store method
3. **Focus page** (`e07dcb0`) — Maximize2 button switches to single-page view for that page
4. **Add Page in canvas mode** (`b6c2e3d`) — "Add Page" button in canvas toolbar opens dialog → AI generates matching HTML
5. **Select page → open chat** (`6034a0f`) — Click a page node on canvas → selects it (blue ring) + auto-opens PageChat sidebar
6. **Agent drag-and-drop** (`bdebc40`) — `AgentsPanel` shows all project agents as draggable cards. Drop onto a page → injects a fully styled chat widget HTML (floating bubble + expandable chat panel using agent's name, color, greeting, position)

**Agent Widget HTML Injection:**
When an agent is dropped onto a page, `handleDropAgent` generates inline HTML/CSS/JS for a chat widget:
- Fixed-position floating bubble (56px circle) in agent's `primaryColor`, positioned per `agent.theme.position` (bottom-right or bottom-left)
- Click bubble → toggles a 360×480px chat panel with agent name, "Online" status, greeting message, text input, send button
- All styled with inline CSS (no external dependencies), uses agent's `primaryColor` throughout
- Widget HTML is appended to the page's existing HTML via `updatePageHtml()`

**Bug Fixes:**
- **LOD edge routing** (`b7c05d4`) — `base-plan-node.tsx` now calls `useUpdateNodeInternals()` on zoom tier change so React Flow re-routes edges when nodes change size between full/compact/dot LOD tiers
- **WebContainer boot reliability** (`6c8f4b1`) — Added 60-second timeout to `WebContainer.boot()` to prevent indefinite hangs; `use-webcontainer.ts` re-throws errors instead of swallowing them
- **Nested BrowserRouter crash** (`2b59b52`) — `sanitizeRouterImports()` strips duplicate Router imports/JSX from AI-generated files before writing to WebContainer
- **Canvas layout direction** (`338f951`) — Switched dagre layout from LR (left-to-right) to TB (top-to-bottom), fixed node overlap
- **Firestore fallback UX** (`441fffd`) — Improved project-not-found UI to explain possible Firestore permission issues, added actionable links to dashboard and new project creation

**Earlier in this window (Feb 20, Session 4):**
- **Advanced Canvas (Phase 14)** — Three sub-phases:
  - **Phase A: Multi-Select + Bulk Actions** — `selectedNodeIds: Set<string>` in UI store with `toggleNodeSelection`, `setSelectedNodes`, `clearSelection`. `selectionOnDrag` rubber-band + `Shift` multi-select in ReactFlow. Blue dashed ring highlighting across all 12 node types. `Ctrl+A` select all, `Escape` clears, `Delete` bulk delete, `Ctrl+D` bulk duplicate. `deleteNodes(ids[])` and `duplicateNodes(ids[])` in project store. `BulkActionsBar` floating toolbar (Set Status, Align 8 options, Distribute H/V, Duplicate, Delete). `lib/canvas-align.ts` alignment helpers.
  - **Phase B: Spring Physics Layout** — `lib/canvas-physics.ts` force-directed engine (repulsion, edge attraction, hierarchy gravity, damping, 80 iterations). Dagre/Spring toggle in toolbar with `Atom` icon. `layoutMode: 'dagre' | 'spring'` in UI store.
  - **Phase C: Level-of-Detail Zoom** — `hooks/use-zoom-level.ts` reads ReactFlow viewport zoom → LOD tier. 3 tiers: `full` (≥0.6), `compact` (0.3–0.6, 180×40px title+status), `dot` (<0.3, 48×28px colored pill). `base-plan-node.tsx` renders progressively.
- **Territory File Sync (Phase 15)** — Bidirectional canvas ↔ Markdown file sync:
  - `lib/territory-serialize.ts` — `nodeToMarkdown()` / `markdownToNode()` round-trip, `projectToTerritory()` / `territoryToProject()`, minimal YAML serializer/parser (zero deps), bundle format
  - `lib/territory-sync.ts` — `diffTerritoryToCanvas()` diff engine, `applyMerge()` with selective accept, field-level change detection
  - `hooks/use-territory-sync.ts` — Export bundle download, export to folder (File System Access API), import from bundle/folder, diff computation, selective merge
  - `components/canvas/territory-sync-panel.tsx` — UI panel with export/import buttons, diff review with per-node accept/reject, summary badges
  - `stores/project-store.ts` — `mergeFromTerritory(nodes, edges)` bulk merge
  - `stores/ui-store.ts` — `territorySyncOpen` + `setTerritorySyncOpen`
  - `canvas-toolbar.tsx` — FolderSync icon button, `Ctrl+T` keyboard shortcut
- **PRD Pipeline (by another agent)** — `buildPrdContext()`, `buildPrdEcosystem()`, `follow-up-generation.ts` prompt, `followUpGenerationSchema`, `lib/export-ralphy.ts`, `downloadRalphyZip()`, `downloadFlatPrdMd()`. PRD Pipeline panel with filter tabs, summary strip, Export ZIP + Export MD buttons. `prdPipelineOpen` + `setPrdPipelineOpen` in UI store. Updated PRD schema with `referencedPrdIds`. `NodePRD` now has `isStale`, `staleReason`. `NodeQuestion` has `category`, `isFollowUp`, `followUpForId`.

### Recent Changes (Feb 19-20, 2026 — Session 3)
- **Landing Page Hero Rewrite** — FeaturesTabs section header changed to "Big Ideas. TinyBaguette." with new subtitle about the spatial engine. `HeroSection` component removed from page (kept in codebase for reference).
- **Hero Prompt Rewrite** — Complete rewrite of `hero-prompt.tsx`. New 4-phase flow: input → loading → preview → email. After user submits a prompt, AI generates a plan, then derives 3 premium page preview cards (Home + 2 from plan nodes). Dark glassmorphism UI with macOS browser chrome, 3 layout variants (hero/dashboard/feed), animated gradient glows, spring animations, staggered reveals. "Continue Building" leads to email capture.
- **Email Capture Gate** — All CTA buttons ("Get Started", "Get Started for Free", "Try It Free") now scroll to `#hero-prompt` instead of linking to `/login`. Email capture modal with validation and success state.
- **About Page** — New `/about` page with company story and philosophy: "Less bloat. More bread. Just keep shipping."
- **Contact Page** — New `/contact` page with `mailto:hello@tinybaguette.com` button.
- **Footer Updates** — Removed Blog link. Updated About → `/about`, Contact → `/contact`, Templates → `#hero-prompt`.
- **Demo Size Reduction** — Demo animation area constrained to 75% width (`max-w-[75%] mx-auto`) for better screen fit.
- **Unused Link Cleanup** — Removed unused `Link` imports from `hero-section.tsx`, `cta-banner.tsx`, `features-tabs.tsx`.

### Recent Changes (Feb 19, 2026 — Session 2)
- **AI Agent Builder** — Full embeddable chatbot feature: `types/agent.ts` (Agent, AgentKnowledgeEntry, AgentAction, AgentBehaviorRule, AgentTheme), `agents?: Agent[]` on Project, 9 CRUD store methods, `agents-view.tsx` with 5 tabs (Config, Knowledge, Theme, Preview, Deploy), `use-agent-chat.ts` hook, `/api/agent/generate` and `/api/agent/[agentId]/chat` API routes, `agent-generation.ts` prompt, `agentGenerationSchema` + `agentChatSchema` in gemini.ts
- **Integrations Landing Demo** — New 4th tab in features-tabs.tsx: animated Supabase + GitHub connection flow with spinner → checkmark, feature sync progress, and live sync activity feed
- **View Restructuring** — `ViewType` changed from `'plan' | 'manage' | 'pages' | 'backend'` to `'plan' | 'design' | 'agents' | 'manage'`. Backend moved under Manage as a `ManageSubView`. Pages renamed to Design.
- **Auto-Save Fix** — `use-project.ts` now saves all project fields (`const { id, ...rest } = currentProject`) instead of only title/description/phase/nodes/edges. This was causing data loss for pages, agents, backend modules, etc.
- **Nested Button Fix** — Changed outer `<button>` to `<div role="button">` in agents-view.tsx agent list to fix hydration error
- **Scroll Fix** — Added `overflow-hidden` to main content container in project-workspace.tsx so AgentsView can scroll
- **Landing Page Reorder** — FeaturesTabs moved to top of landing page (above hero), tab buttons above demo area
- **Agents Demo Animation** — Bot builder demo with character-by-character typing, deploy progress bar, floating chat widget on mock website. All timings slowed 25% for readability.
- **Arrow Markers on Edges** — Planning demo connection lines now have arrow markers at both ends

### Earlier Changes (Feb 18-19, 2026)
- **Interactive Feature Demos** — Replaced static features grid with tabbed interactive demos (`features-tabs.tsx`): Planning demo with AI chat sidebar that progressively builds a node graph, Pages demo with 6 mini-webpage previews showing AI-driven color change and image insertion
- **AI Chat Simulation** — Planning demo auto-plays a conversation where user and AI discuss building a Music Festival App; nodes appear on the graph as the conversation progresses
- **Pages Demo AI Actions** — Two-step AI interaction: (1) user asks to change accent to pink → all 6 pages smoothly transition colors with 0.6s CSS transitions, (2) user asks to add hero image → concert banner animates into the Lineup page
- **HSL Alpha Helper** — `accentAlpha()` function for proper HSL color transparency (replaces invalid hex concatenation on HSL strings)
- **Hero Prompt** — New animated prompt input (`hero-prompt.tsx`) with rotating placeholder ideas and clickable example chips (festival/creative app themed)
- **Demo Timing** — Optimized animation timing for snappy feel (Planning: ~8s total, Pages: ~6s total)

### Earlier Changes (Feb 12, 2026 — Session 3)
- **Pages View** — New 7th view: AI auto-scans project plan, identifies all UI pages/screens, generates full-fidelity Tailwind HTML previews rendered in 1280x800 iframes on a zoomable React Flow canvas. Pages are flow-grouped by navigation with animated edges. Inline chat per page for AI-driven edits. Copy HTML to clipboard.
- **Auto-Layout Fix** — `planNodesToFlow` now preserves existing node positions instead of resetting to (0,0). Nodes no longer stack after content changes.
- **Goal Progress in Toolbar** — Merged TimelineBar goal progress circles into the ProjectToolbar.
- **New Landing Page** — Replaced static mockup hero with interactive showcase (animated canvas, sortable task table, animated Gantt chart demos). Added "One-Shot Pipeline" section with 5-step animated walkthrough. Updated messaging: "Your Entire Project. Planned in One Shot."
- **New API Routes** — `/api/ai/generate-pages` (full project page generation) and `/api/ai/edit-page` (inline page editing)
- **New Types** — `ProjectPage`, `PageEdge` in `types/project.ts`; `pages`, `pageEdges` fields on Project
- **New Store Actions** — `setPages`, `updatePageHtml`, `updatePagePosition`, `addPageEdge`, `removePageEdge`, `removePage`

### Earlier Changes (Feb 12, 2026 — Session 2)
- **Unified Project Toolbar** — Merged ViewSwitcher into ProjectToolbar: back button, editable project name, save status indicator, view tabs, and action buttons (Chat, Team, AI, History, Integrations, Share) all in one compact row
- **Interactive Gantt Chart** — Timeline view now supports drag-to-move bars, drag left/right edges to resize durations, live preview while dragging, snaps to day grid
- **5 New Node Types** — `spec`, `prd`, `schema`, `prompt`, `reference` with type-specific fields (schemaType, promptType, targetTool, referenceType, url, acceptanceCriteria, version)
- **5 New Edge Types** — `informs`, `defines`, `implements`, `references`, `supersedes` with distinct visual styles
- **New Project Page Header** — `/project/new` now has a header bar with Back button, project title, and Save & Open Workspace button (replaces floating canvas button)
- **Chat State Reset** — Navigating to `/project/new` now resets the chat store (clears previous project's messages)
- **Tiptap SSR Fix** — Added `immediatelyRender: false` to prevent hydration mismatch
- **React Flow Edge Fix** — Changed deprecated `type: 'bezier'` to `type: 'default'`
- **Firestore DB Provisioned** — Database created in Firebase console, resolving "Database not found" errors

### Earlier Changes (Feb 12, 2026 — Session 1)
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
