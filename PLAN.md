# VisionPath Implementation Plan

> Living checklist reflecting actual implementation status as of February 2026.

---

## Status Legend

- `[ ]` Pending
- `[~]` In Progress
- `[x]` Completed

---

## Phase 1: Foundation ✅

### 1.1 Project Structure
- [x] Next.js App Router with `app/`, `components/`, `stores/`, `types/`, `lib/`, `hooks/`, `services/`, `prompts/`
- [x] `app/globals.css` with Tailwind, CSS variables, dark theme, node colors
- [x] `tailwind.config.ts` with custom node-type color tokens
- [x] TypeScript strict mode, path aliases (`@/*`)

### 1.2 Type Definitions
- [x] `types/project.ts` — NodeType (7 types), NodeStatus, PlanNode, NodePRD, NodePrompt, Project
- [x] `types/canvas.ts` — PlanNodeData, FlowNode, FlowEdge
- [x] `types/chat.ts` — ChatMessage, AIPlanNode

### 1.3 Zustand Stores
- [x] `stores/project-store.ts` — Full project/node/edge CRUD, PRD/prompt methods
- [x] `stores/chat-store.ts` — AI chat message history
- [x] `stores/ui-store.ts` — Selected node, panel state

---

## Phase 2: Visual Canvas ✅

### 2.1 Canvas
- [x] `components/canvas/graph-canvas.tsx` — React Flow wrapper with dark theme
- [x] Dot grid background, minimap, controls
- [x] Pan/zoom (0.1x–2x range)
- [x] `fitView` on load and layout changes

### 2.2 Custom Nodes (7 types)
- [x] `base-plan-node.tsx` — Shared layout for goal/subgoal/feature/task
- [x] `goal-node.tsx`, `subgoal-node.tsx`, `feature-node.tsx`, `task-node.tsx`
- [x] `moodboard-node.tsx` — Image grid with empty state
- [x] `notes-node.tsx` — Rich text content display
- [x] `connector-node.tsx` — Compact status waypoint
- [x] `node-types.ts` — Registry mapping type strings → components
- [x] `node-toolbar.tsx` — Hover toolbar (edit, status cycle, collapse, add child)

### 2.3 Edges
- [x] Dashed bezier curves (`strokeDasharray: '6 4'`)
- [x] Edges auto-generated from `parentId` relationships
- [x] Manual edge creation via drag between handles (`onConnect`)

### 2.4 Auto-Layout
- [x] `hooks/use-auto-layout.ts` — Dagre integration
- [x] Re-layout button in `canvas-toolbar.tsx`
- [x] Auto-layout on node count change

### 2.5 Context Menus
- [x] `node-context-menu.tsx` — Right-click node: edit, type, status, add child/sibling, duplicate, delete
- [x] `pane-context-menu.tsx` — Right-click canvas: add any node type with smart parent suggestion
- [x] Smart mapping: nearest valid parent by hierarchy rules + proximity

---

## Phase 3: Detail Panel ✅

- [x] `node-detail-panel.tsx` — Slide-out panel on node selection
- [x] Title/description editing via `node-edit-form.tsx`
- [x] Type changing, status changing
- [x] Parent/children navigation
- [x] Add child node inline
- [x] Duplicate and delete actions
- [x] Question answering (from AI onboarding)
- [x] Collapse/expand children

---

## Phase 4: Rich Content ✅

### 4.1 Images (Moodboard)
- [x] Drag-and-drop image upload
- [x] File picker upload
- [x] Clipboard paste (`Ctrl+V`)
- [x] URL input fallback
- [x] Base64 data URL storage
- [x] Image grid display with remove buttons

### 4.2 Rich Text (Notes)
- [x] `rich-text-editor.tsx` — Tiptap editor with formatting toolbar
- [x] Bold, italic, strike, bullet list, ordered list, code block

### 4.3 PRDs
- [x] Add/edit/remove PRDs on any node
- [x] Title + monospaced content textarea
- [x] One-click copy to clipboard
- [x] Content preview (first 200 chars)
- [x] AI-powered PRD generation for feature/subgoal nodes

### 4.4 IDE Prompts
- [x] Add/edit/remove prompts on any node
- [x] Title + monospaced content textarea
- [x] One-click copy to clipboard for pasting into IDE
- [x] Content preview (first 150 chars)
- [x] AI-powered prompt generation for feature/subgoal nodes

---

## Phase 5: AI Integration ✅

### 5.1 Onboarding
- [x] `project-onboarding.tsx` — 7-step questionnaire
- [x] AI feature suggestions via `/api/ai/suggest-features`
- [x] Summary page with "Start Planning" button

### 5.2 Chat Planning
- [x] `planning-chat.tsx` — Full chat interface
- [x] `/api/ai/chat` — Gemini 2.0 Flash integration
- [x] System prompts in `prompts/planning-system.ts`
- [x] Structured JSON response → `mergeNodes()` adds to canvas
- [x] Streaming responses with typing indicator

### 5.3 AI PRD & Prompt Generation
- [x] `lib/node-context.ts` — `buildNodeContext()` gathers full hierarchy context
- [x] `prompts/prd-generation.ts` — PRD system prompt (9 sections)
- [x] `prompts/prompt-generation.ts` — Implementation prompt system prompt (8 sections)
- [x] `services/gemini.ts` — `prdGenerationSchema` and `promptGenerationSchema`
- [x] `/api/ai/generate-prd` — POST endpoint for PRD generation
- [x] `/api/ai/generate-prompt` — POST endpoint for prompt generation
- [x] Generate buttons in detail panel for feature/subgoal nodes
- [x] Loading state (spinner), error handling (dismissible banner)
- [x] Non-destructive: each generation adds a new entry to the array

---

## Phase 6: Connections & Smart Mapping ✅

- [x] Manual edge creation: drag source handle → target handle
- [x] `connectNodes()` / `setNodeParent()` store methods
- [x] Smart mapping in pane context menu
- [x] Hierarchy rules: subgoal→goal, feature→subgoal/goal, task→feature/subgoal
- [x] Nearest parent by flow position distance

---

## Phase 7: Infrastructure ✅

- [x] Firebase auth/firestore services (null-guarded, optional)
- [x] App works fully without Firebase (in-memory Zustand)
- [x] Git repo initialized and pushed to GitHub
- [x] Vercel deployment ready
- [x] `public/favicon.svg` added

---

## Phase 8: Export & Import ✅

### 8.1 JSON Export/Import
- [x] `lib/export-import.ts` — `exportProjectAsJSON()`, `importProjectFromJSON()`, `downloadFile()`, `readFileContent()`
- [x] `components/dashboard/import-project-button.tsx` — JSON file upload on dashboard
- [x] Canvas toolbar export dropdown with JSON download

### 8.2 Markdown Context Export
- [x] `lib/export-markdown.ts` — `exportSubtreeAsMarkdown()`, `exportFullPlanAsMarkdown()`
- [x] `lib/export-project-files.ts` — `generateCursorRules()`, `generateClaudeMD()`, `generatePlanMD()`, `generateTasksMD()`
- [x] Canvas toolbar export dropdown: Full Plan MD, Tasks MD, .cursorrules, CLAUDE.md, Copy to Clipboard
- [x] Node context menu: "Copy Context for AI", "Export as Markdown"

### 8.3 Markdown Spec Import
- [x] `lib/import-markdown.ts` — `parseMarkdownToNodes()` (heading hierarchy, checklists, frontmatter)
- [x] `components/dashboard/import-markdown-modal.tsx` — Paste/upload with live preview
- [x] Dashboard "Import Markdown" button
- [x] New project flow import option

---

## Phase 9: Typed Edges & Blast Radius ✅

### 9.1 Typed Edge System
- [x] `types/project.ts` — `EdgeType` (`hierarchy` | `blocks` | `depends_on`), `ProjectEdge` with `edgeType` and `label`
- [x] `stores/project-store.ts` — `addDependencyEdge()`, `removeDependencyEdge()`
- [x] `planNodesToFlow()` renders typed edges with visual styles (red dashed for blocks, blue dashed for depends_on)
- [x] Node context menu: "Add Blocks Edge", "Add Depends On Edge"
- [x] `stores/ui-store.ts` — `pendingEdge` state for edge creation flow

### 9.2 Blast Radius
- [x] `lib/blast-radius.ts` — `getBlastRadius()`, `getBlastRadiusSummary()`
- [x] Canvas toolbar Radar toggle for blast radius mode
- [x] `graph-canvas.tsx` — dims unaffected nodes to 0.25 opacity when active

---

## Phase 10: Shareable Plans ✅

- [x] `types/project.ts` — `isPublic`, `shareId` fields on Project
- [x] `stores/project-store.ts` — `toggleShareProject()`
- [x] `components/share/share-button.tsx` — Popover with public/private toggle, copy link
- [x] `components/share/shared-plan-view.tsx` — Read-only canvas rendering
- [x] `app/share/[id]/page.tsx` — Share page with error states

---

## Phase 11: Template Library ✅

- [x] `lib/templates/` — 3 seed templates: Auth System (24 nodes), CRUD API (22 nodes), Landing Page (20 nodes)
- [x] `components/onboarding/template-gallery.tsx` — Template cards with tags and use button
- [x] `components/onboarding/new-project-chooser.tsx` — 3-option entry (AI Chat / Template / Import)
- [x] `app/project/new/page.tsx` — Updated with chooser screen

---

## Future Work

### Real-Time Collaboration
- [ ] Yjs CRDT integration
- [ ] WebSocket sync (PartyKit or similar)
- [ ] Presence cursors

### Advanced Canvas
- [ ] Spring physics (d3-force)
- [ ] Multi-select
- [ ] Level of detail (LOD) zoom

### Territory Sync
- [ ] Bidirectional file sync (canvas ↔ Markdown)
- [ ] Chokidar file watcher
- [ ] YAML frontmatter serialization

### Polish
- [ ] Keyboard shortcut discoverability (help overlay)
- [ ] Edge deletion UI (click edge to select, then delete)
- [ ] Image compression / size limits
- [ ] `changeNodeType` hierarchy validation

---

## Notes

- Firebase is optional — all env vars guarded at init
- Images stored as base64 data URLs (no external storage needed)
- PRDs and prompts designed for copy-paste into IDE workflows
- Smart mapping uses `PARENT_TYPE_MAP` hierarchy + Euclidean distance
- Typed edges: `blocks` (red dashed, animated), `depends_on` (blue dashed)
- Blast radius traverses children + dependency edges recursively
- Export supports 7 formats: JSON, Full Plan MD, Tasks MD, .cursorrules, CLAUDE.md, plan.md, tasks.md
- Markdown import maps heading levels: # → goal, ## → subgoal, ### → feature, #### → task
- 3 seed templates available: SaaS Auth, REST API, Landing Page
