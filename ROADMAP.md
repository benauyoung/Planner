# TinyBaguette Roadmap

> Milestone tracking. Updated February 23, 2026 to reflect actual progress.

---

## Milestones

### M1: Working Canvas ✅
**Status**: � Complete

**Delivered**:
- React Flow canvas with dark theme, dot grid, minimap, controls
- 7 custom node types (goal, subgoal, feature, task, moodboard, notes, connector)
- Dashed bezier curve edges from `parentId` relationships
- Pan/zoom, drag to reposition, fitView
- Node toolbar (hover: edit, status, collapse, add child)

---

### M2: Auto-Layout ✅
**Status**: � Complete

**Delivered**:
- Dagre hierarchical auto-layout (`hooks/use-auto-layout.ts`)
- Re-layout button in canvas toolbar
- Auto-layout triggers on node count change

---

### M3: Detail Panel ✅
**Status**: � Complete

**Delivered**:
- Slide-out panel on node click
- Title/description editing
- Type and status changing
- Parent/children navigation
- Add child, duplicate, delete actions
- Question answering from AI onboarding

---

### M4: AI Integration ✅
**Status**: � Complete

**Delivered**:
- Gemini 2.0 Flash via `/api/ai/chat`
- Project onboarding questionnaire (7 steps)
- AI feature suggestions via `/api/ai/suggest-features`
- Chat interface with streaming responses
- Structured JSON → `mergeNodes()` adds nodes to canvas

---

### M5: Rich Content ✅
**Status**: � Complete

**Delivered**:
- Moodboard image upload (drag-drop, file picker, clipboard paste, URL)
- Rich text editor (Tiptap) for notes nodes
- PRD attachments on any node (add, edit, remove, copy-to-clipboard)
- IDE prompt attachments on any node (add, edit, remove, copy-to-clipboard)

---

### M6: Connections & Smart Mapping ✅
**Status**: � Complete

**Delivered**:
- Manual edge creation: drag source → target handle
- `connectNodes()` and `setNodeParent()` store methods
- Pane context menu (right-click empty canvas → add node)
- Smart parent suggestion by hierarchy rules + proximity
- Node context menu (right-click node → full action menu)

---

### M7: Infrastructure ✅
**Status**: Complete

**Delivered**:
- Firebase auth/firestore (null-guarded, works without keys)
- Git repo on GitHub (`benauyoung/Planner`)
- Vercel deployment ready
- Favicon, metadata, .gitignore

---

### M7.5: AI PRD & Prompt Generation ✅
**Status**: Complete

**Delivered**:
- One-click PRD generation for feature/subgoal nodes via Gemini
- One-click implementation prompt generation for feature/subgoal nodes
- Full hierarchy context gathering (parent chain, Q&A, siblings, children)
- Non-destructive: each generation adds a new entry
- Loading spinner and dismissible error banner
- Two new API routes (`/api/ai/generate-prd`, `/api/ai/generate-prompt`)
- Context utility (`lib/node-context.ts`) and system prompts

---

### M8: Persistence ✅
**Status**: Complete

**Delivered**:
- Firebase Firestore save/load via `services/firestore.ts`
- LocalStorage fallback via `services/local-storage.ts`
- Persistence abstraction layer (`services/persistence.ts`) auto-selects backend
- Auto-save with 2s debounce in `hooks/use-project.ts`
- JSON export/import (`lib/export-import.ts`): download `.tinybaguette.json`, import from dashboard
- Export button in canvas toolbar, Import button on dashboard

---

### M9: Real-Time Collaboration ✅
**Status**: Complete (Infrastructure)

**Delivered**:
- Pluggable collaboration provider abstraction (`services/collaboration.ts`)
- `LocalCollaborationProvider` mock for development
- `useCollaboration` hook with cursor/node selection sync
- `PresenceAvatars` component with online status dots
- `PresenceCursors` component with animated cursor rendering + name labels
- Ready for Yjs/PartyKit/Liveblocks backend connection

**Remaining** (production):
- Deploy WebSocket backend (PartyKit or Liveblocks)
- Connect Yjs CRDT document to Zustand store

---

### M10: Landing Page & Route Restructure ✅
**Status**: Complete

**Delivered**:
- Public landing page at `/` with hero, trust bar, how-it-works, features grid, CTA, footer
- 8 new components in `components/landing/`
- Next.js route groups: `(marketing)` for public, `(app)` for authenticated
- Dashboard moved to `/dashboard` with animated loading screen
- Root layout stripped to html/body/fonts only
- Auth redirects updated for new `/dashboard` path
- Firestore runtime failover to localStorage via `withFallback()` in persistence.ts

---

### M11: Feature Expansion (12 Phases) ✅
**Status**: Complete

**Delivered** (Feb 12, 2026):
- **Phase 1**: Command Palette (`Cmd+K`) + keyboard shortcuts + `?` help overlay
- **Phase 2**: Multiple views — List, Table, Board (Kanban), Timeline (Gantt), Sprints (6 total)
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

### M12.5: UX Polish & Interactive Timeline ✅
**Status**: Complete

**Delivered** (Feb 12, 2026 — Session 2):
- Unified project toolbar: merged ViewSwitcher into ProjectToolbar (back, title, save status, view tabs, action icons)
- Interactive Gantt chart: drag bars to move tasks, drag left/right edges to resize durations, live preview, snap-to-day
- 5 new document node types: spec, prd, schema, prompt, reference (with type-specific fields)
- 5 new edge types: informs, defines, implements, references, supersedes
- New project page header with Back button + Save & Open Workspace button
- Chat state reset when navigating to /project/new
- Tiptap SSR fix (immediatelyRender: false)
- React Flow edge fix (deprecated bezier → default)
- Firestore database provisioned

---

### M12.6: Pages View & Landing Page Overhaul ✅
**Status**: Complete

**Delivered** (Feb 12, 2026 — Session 3):
- **Pages View** — New 7th view: AI auto-scans project plan, identifies UI pages, generates full-fidelity Tailwind HTML in 1280x800 iframes on a zoomable React Flow canvas
- Flow-grouped layout with animated navigation edges between pages
- Inline chat per page for AI-driven edits (click page → describe changes → AI regenerates HTML)
- Copy HTML to clipboard, delete pages, regenerate all
- New API routes: `/api/ai/generate-pages`, `/api/ai/edit-page`
- New types: `ProjectPage`, `PageEdge`; 6 new store actions
- **Auto-Layout Fix** — `planNodesToFlow` preserves existing node positions; nodes no longer stack after content changes
- **Goal Progress in Toolbar** — Merged TimelineBar into ProjectToolbar
- **New Landing Page** — Interactive showcase (animated canvas, sortable task table, animated Gantt demos), one-shot pipeline section, updated messaging

---

### M13: AI Agent Builder & Landing Polish ✅
**Status**: Complete

**Delivered** (Feb 19, 2026):
- Full embeddable AI chatbot builder: `types/agent.ts` (Agent, AgentKnowledgeEntry, AgentAction, AgentBehaviorRule, AgentTheme)
- `agents?: Agent[]` on Project, 9 CRUD store methods
- `agents-view.tsx` with 5 tabs: Config, Knowledge, Theme, Preview, Deploy
- `/api/agent/generate` and `/api/agent/[agentId]/chat` API routes
- `use-agent-chat.ts` hook for live preview
- Agents demo tab on landing page (animated bot builder + floating chat widget)
- Interactive feature demos: Planning, Design, Agents, Integrations tabs
- View restructuring: `'plan' | 'design' | 'agents' | 'manage'` (Backend moved under Manage)
- Auto-save fix: saves all project fields (was only saving title/description/phase/nodes/edges)

---

### M13.5: Landing Page & Marketing ✅
**Status**: Complete

**Delivered** (Feb 19-20, 2026):
- Landing page hero rewrite: "Big Ideas. TinyBaguette." with spatial engine subtitle
- Hero prompt rewrite: 4-phase flow (input → loading → preview → email) with glassmorphism UI
- Email capture gate: all CTAs scroll to `#hero-prompt` instead of `/login`
- About page (`/about`) and Contact page (`/contact`)
- Footer updates: removed Blog, added About/Contact links
- Demo size reduction (75% width constraint)
- Email capture to Firestore waitlist + optional Resend welcome email

---

### M14: Advanced Canvas ✅
**Status**: Complete

**Delivered** (Feb 20, 2026):
- **Phase A: Multi-Select + Bulk Actions** — `selectedNodeIds: Set<string>`, rubber-band selection, Shift+click, Ctrl+A. Blue dashed ring highlighting across 12 node types. `BulkActionsBar` floating toolbar (Set Status, Align 8 options, Distribute H/V, Duplicate, Delete). `lib/canvas-align.ts` helpers.
- **Phase B: Spring Physics Layout** — `lib/canvas-physics.ts` force-directed engine (repulsion, edge attraction, hierarchy gravity, damping, 80 iterations). Dagre/Spring toggle in toolbar. `layoutMode: 'dagre' | 'spring'` in UI store.
- **Phase C: Level-of-Detail Zoom** — `hooks/use-zoom-level.ts` reads viewport zoom → LOD tier. 3 tiers: `full` (≥0.6), `compact` (0.3–0.6, 180×40px), `dot` (<0.3, 48×28px). `base-plan-node.tsx` renders progressively.

---

### M15: Territory File Sync ✅
**Status**: Complete

**Delivered** (Feb 20, 2026):
- Bidirectional canvas ↔ Markdown file sync
- `lib/territory-serialize.ts` — round-trip node↔markdown, minimal YAML (zero deps), bundle format
- `lib/territory-sync.ts` — diff engine, selective merge, field-level change detection
- `hooks/use-territory-sync.ts` — export bundle/folder, import bundle/folder, diff + merge
- `components/canvas/territory-sync-panel.tsx` — UI with export/import, per-node accept/reject diff review
- `mergeFromTerritory(nodes, edges)` in project store
- FolderSync icon button + `Ctrl+T` shortcut in canvas toolbar

---

### M15.5: PRD Pipeline ✅
**Status**: Complete

**Delivered** (Feb 20, 2026):
- Context-aware PRD generation: `buildPrdContext()`, `buildPrdEcosystem()`
- Deep question flow: follow-up generation via `/api/ai/generate-followups`
- Ralphy export: `downloadRalphyZip()` (ZIP with YAML frontmatter), `downloadFlatPrdMd()`
- PRD status tracking: 6 statuses (needs_questions → answering → ready → generated → stale → export_ready)
- Stale detection propagates to dependents via `updateNodePRD()`
- PRD Pipeline panel: filter tabs, summary strip, Export ZIP + Export MD buttons
- Updated types: `NodePRD.referencedPrdIds`, `isStale`, `staleReason`; `NodeQuestion.category`, `isFollowUp`

---

### M16: Design Tab Rewrite & Agent Integration ✅
**Status**: Complete

**Delivered** (Feb 20-22, 2026):
- **Design tab rewritten** — Replaced WebContainer with srcdoc iframes (no SharedArrayBuffer needed, works on all browsers)
- AI generates standalone HTML pages with Tailwind CSS via `/api/ai/generate-pages`
- Two view modes: single-page (viewport switcher) and canvas (React Flow with all pages)
- `PageChat` sidebar for AI-driven page editing via `/api/ai/edit-page`
- Canvas page interactions: inline AI editing, delete, focus, select-to-chat
- Add Page dialog: AI generates new pages matching design system
- **Agent drag-and-drop**: collapsible AgentsPanel with draggable agent cards, green ring highlight on drag-over, drop injects styled chat widget HTML into page
- LOD edge routing fix: `useUpdateNodeInternals()` on zoom tier change
- Canvas layout switched from LR to TB, fixed node overlap
- Improved Firestore fallback UX with actionable error messages

---

### M17: Production Polish 🟡
**Status**: In Progress

**Remaining**:
- [ ] Remove legacy WebContainer files and unused dependencies (`@webcontainer/api`, `@monaco-editor/react`, `jszip`)
- [ ] Remove COOP/COEP headers from `next.config.js` (no longer needed)
- [ ] Performance audit: bundle size, lazy loading, code splitting
- [ ] Accessibility audit: keyboard navigation, screen reader support, ARIA labels
- [ ] Error boundaries on all major views
- [ ] E2E tests (Playwright) for critical flows

---

### M18: Real-Time Collaboration (Production) 🔴
**Status**: Planned

**Planned**:
- Deploy WebSocket backend (PartyKit or Liveblocks)
- Connect Yjs CRDT document to Zustand store
- Conflict resolution for concurrent edits
- Real-time cursor + selection sync (infrastructure already built in M9)

---

### M19: Production Integrations 🔴
**Status**: Planned

**Planned**:
- Server-side OAuth flows for GitHub, Slack, Linear (currently client-side stubs)
- Webhook receivers for real-time sync
- Two-way issue sync (Linear ↔ TinyBaguette nodes)
- GitHub PR creation from task nodes

---

### M20: Design Tab Deepening 🔴
**Status**: Planned

**Planned**:
- Interactive element editing: click elements in Design preview to edit text, colors, spacing inline
- Component-level iteration: select a section/component within a page and iterate on it independently
- Design-to-Plan feedback: page edits propagate changes back to corresponding PRDs and node details
- Page version history: track iterations per page with undo/restore
- Responsive preview improvements: better mobile/tablet rendering fidelity
- CSS/style inspector panel for power users

---

### M21: Agent System Expansion 🔴
**Status**: Planned

**Planned**:
- Multi-agent orchestration: define agent teams that coordinate on tasks
- Agent-to-agent communication: agents can delegate, query, and hand off to other agents
- Agent triggers and workflows: event-driven agent activation (e.g., form submit → agent responds)
- Agent memory: persistent conversation context across sessions
- Agent analytics dashboard: usage metrics, conversation logs, satisfaction tracking
- BYOK (Bring Your Own Key): users provide their own API keys for agent backends

---

### M22: Monetization & Scale 🔴
**Status**: Planned

**Planned**:
- User accounts with project ownership (currently single-user)
- Team workspaces with role-based access
- Usage-based billing for AI features (Gemini API)
- Custom domain for deployed agents
- Email infrastructure at `hello@tinybaguette.com`

---

## Version Targets

### v0.1.0 - Alpha ✅
- Full canvas with 7 node types
- AI onboarding + chat planning
- Rich content: images, PRDs, prompts, notes
- AI-powered PRD and prompt generation
- Smart mapping + manual connections
- Single-user, in-memory

### v0.5.0 - Beta ✅
- Firebase persistence ✅
- JSON export/import ✅
- Keyboard shortcuts ✅
- Undo/redo ✅
- Markdown context export ✅ (subtree + full plan, .cursorrules, CLAUDE.md, plan.md, tasks.md)
- Markdown spec import ✅ (parser + import modal + file upload)
- Typed edges & blast radius ✅ (blocks/depends_on edges, blast radius preview)
- Shareable plans ✅ (public toggle, share URL, read-only view)
- Template library ✅ (3 seed templates, gallery UI, new project chooser)
- Landing page ✅ (public marketing page, route groups, animated dashboard loader)
- Persistence failover ✅ (runtime Firestore → localStorage fallback)

### v0.9.0 - Feature Complete ✅
- All 12 feature phases implemented
- 4 view tabs (Plan, Design, Agents, Manage) with 6 Manage sub-views
- AI iteration + smart suggestions
- Team management, comments, activity feed
- Sprint planning with drag-and-drop
- Version history with snapshots
- Embedded docs (Notion-style block editor)
- Collaboration infrastructure (presence, cursors)
- Integrations (GitHub, Slack, Linear)

### v0.9.5 - UX Polish ✅
- Unified project toolbar (single bar with all controls)
- Interactive Gantt chart (drag-to-move, edge-resize)
- 12 node types (5 new document types)
- 8 edge types (5 new relationship types)
- New project page header with Save & Open Workspace
- Chat state reset on new project
- Bug fixes: Tiptap SSR, React Flow edge type, Firestore provisioning

### v0.9.6 - Pages View & Landing ✅
- Pages View: AI-generated full-fidelity Tailwind page previews on zoomable canvas
- 4 view tabs with Design (Pages), Agents, and 6 Manage sub-views incl. Backend
- Inline chat per page for AI editing
- Auto-layout fix: position preservation on node updates
- New interactive landing page with one-shot pipeline messaging
- 2 new API routes (generate-pages, edit-page)
- 6 new store actions for page management

### v0.9.7 - AI Agents & Landing Polish ✅
- Full AI agent builder (config, knowledge, theme, preview, deploy)
- Embeddable chatbot with persona, knowledge base, behavior rules
- Interactive landing page demos (Planning, Design, Agents, Integrations)
- Hero prompt with 4-phase flow + email capture
- About and Contact pages
- Auto-save fix for all project fields

### v0.9.8 - Advanced Canvas & Sync ✅
- Multi-select + bulk actions (rubber-band, Shift+click, Ctrl+A, BulkActionsBar)
- Spring physics force-directed layout
- Level-of-detail zoom (full → compact → dot)
- Territory file sync (bidirectional canvas ↔ Markdown)
- PRD pipeline with status tracking, stale detection, Ralphy export

### v0.9.9 - Design Tab Rewrite & Agent Integration ✅ (Current)
- Design tab rewritten: srcdoc iframes replace WebContainer (no SharedArrayBuffer needed)
- Canvas page interactions: inline AI editing, delete, focus, select-to-chat, add page
- Agent drag-and-drop onto Design canvas pages (injects chat widget HTML)
- LOD edge routing fix, canvas layout TB, Firestore fallback UX

### v1.0.0 - Launch (Planned)
- Legacy code cleanup (remove WebContainer files, unused deps)
- Performance + accessibility audit
- E2E test coverage
- Production ready for single-user

### v1.1.0 - Collaboration (Planned)
- Production WebSocket backend for real-time multi-user editing
- Yjs CRDT integration

### v1.2.0 - Integrations (Planned)
- Server-side OAuth for GitHub/Slack/Linear
- Two-way issue sync, webhook receivers

### v1.3.0 - Design Deepening (Planned)
- Interactive element editing in Design preview
- Component-level iteration (select + iterate on page sections)
- Design-to-Plan feedback loop
- Page version history

### v1.4.0 - Agent Expansion (Planned)
- Multi-agent orchestration (agent teams)
- Agent-to-agent communication
- Agent triggers and workflows
- Agent memory and analytics
- BYOK (Bring Your Own Key)

### v2.0.0 - Scale (Planned)
- Multi-user workspaces with roles
- Usage-based billing
- Custom agent domains

---

## Change Log

| Date | Change |
|------|--------|
| 2025-01 | Initial roadmap created |
| 2026-02-09 | Updated to reflect actual progress: M1–M7 complete, added PRDs/prompts/smart mapping |
| 2026-02-10 | Added M7.5: AI-powered PRD and prompt generation from node hierarchy context |
| 2026-02-11 | M8 Persistence verified complete; added JSON export/import; began MVP gap-fill sprint |
| 2026-02-11 | v0.5.0 Beta complete: context export, markdown import, typed edges, blast radius, sharing, templates |
| 2026-02-11 | Landing page + route restructure: (marketing)/(app) route groups, 8 landing components |
| 2026-02-11 | Firestore runtime failover + animated dashboard loader |
| 2026-02-12 | Full project handoff documentation update |
| 2026-02-12 | M11 Feature Expansion: All 12 phases implemented (command palette, views, assignees, AI iteration, comments, timeline, sprints, AI suggestions, version history, embedded docs, collaboration, integrations) |
| 2026-02-12 | v0.9.0 Feature Complete: 55+ store mutations, 6 views, 7 API routes, 3 integration clients |
| 2026-02-12 | v0.9.5 UX Polish: unified toolbar, interactive Gantt, 5 new node types, 5 new edge types, bug fixes |
| 2026-02-12 | v0.9.6 Pages View: AI page generation, inline chat editing, auto-layout fix, new landing page |
| 2026-02-19 | M13: AI Agent Builder, interactive landing demos, view restructuring, auto-save fix |
| 2026-02-19 | v0.9.7: Landing page hero/prompt rewrite, email capture, about/contact pages |
| 2026-02-20 | M14: Advanced Canvas (multi-select, spring physics, LOD zoom) |
| 2026-02-20 | M15: Territory File Sync (bidirectional canvas ↔ Markdown) |
| 2026-02-20 | M15.5: PRD Pipeline (status tracking, stale detection, Ralphy export) |
| 2026-02-20 | v0.9.8: Advanced Canvas + Sync milestone |
| 2026-02-22 | M16: Design Tab rewrite (srcdoc iframes), canvas page interactions, agent drag-and-drop |
| 2026-02-22 | v0.9.9: Current version — Design tab + agent integration milestone |
| 2026-02-23 | Added M20 (Design Tab Deepening) and M21 (Agent System Expansion) to roadmap |
| 2026-02-23 | Three Pillars framing added to all documentation |
