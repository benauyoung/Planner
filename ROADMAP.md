# VisionPath Roadmap

> Milestone tracking. Updated February 2026 to reflect actual progress.

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

### M8: Persistence 🔴
**Status**: Not Started

**Planned**:
- Firebase Firestore save/load
- LocalStorage fallback
- Export/import as JSON

---

### M9: Real-Time Collaboration 🔴
**Status**: Not Started

**Planned**:
- Yjs CRDT integration
- WebSocket sync
- Presence cursors
- Conflict resolution

---

### M10: Advanced Polish 🔴
**Status**: Not Started

**Planned**:
- Keyboard shortcuts
- Multi-select
- Undo/redo
- Spring physics (d3-force)
- Territory file sync

---

## Version Targets

### v0.1.0 - Alpha ✅ (Current)
- Full canvas with 7 node types
- AI onboarding + chat planning
- Rich content: images, PRDs, prompts, notes
- AI-powered PRD and prompt generation
- Smart mapping + manual connections
- Single-user, in-memory

### v0.5.0 - Beta (Planned)
- Firebase persistence
- Export/import
- Keyboard shortcuts
- Undo/redo

### v1.0.0 - Launch (Planned)
- Real-time collaboration
- Territory file sync
- Full polish
- Production ready

---

## Change Log

| Date | Change |
|------|--------|
| 2025-01 | Initial roadmap created |
| 2026-02-09 | Updated to reflect actual progress: M1–M7 complete, added PRDs/prompts/smart mapping |
| 2026-02-10 | Added M7.5: AI-powered PRD and prompt generation from node hierarchy context |
