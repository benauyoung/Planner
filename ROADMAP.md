# VisionPath Roadmap

> Milestone tracking. Updated February 12, 2026 to reflect actual progress.

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
- JSON export/import (`lib/export-import.ts`): download `.visionpath.json`, import from dashboard
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

### M13: Remaining Polish 🟡
**Status**: Planned

**Planned**:
- Multi-select on canvas
- Spring physics (d3-force)
- Territory file sync
- Image compression
- Hierarchy validation on type change
- Production OAuth for integrations

---

## Version Targets

### v0.1.0 - Alpha ✅ (Current)
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
- 6 views: Canvas, List, Table, Board, Timeline, Sprints
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
- 7 edge types (5 new relationship types)
- New project page header with Save & Open Workspace
- Chat state reset on new project
- Bug fixes: Tiptap SSR, React Flow edge type, Firestore provisioning

### v0.9.6 - Pages View & Landing ✅ (Current)
- Pages View: AI-generated full-fidelity Tailwind page previews on zoomable canvas
- 7 views total (added Pages)
- Inline chat per page for AI editing
- Auto-layout fix: position preservation on node updates
- New interactive landing page with one-shot pipeline messaging
- 2 new API routes (generate-pages, edit-page)
- 6 new store actions for page management

### v1.0.0 - Launch (Planned)
- Production WebSocket backend for real-time collaboration
- OAuth flows for GitHub/Slack/Linear
- Territory file sync
- Image compression + performance polish
- Production ready

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
