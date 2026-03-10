# TinyBaguette Implementation Plan

> Living checklist reflecting actual implementation status as of March 10, 2026.

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
- [x] `types/project.ts` — NodeType (12 types), NodeStatus, PlanNode, NodePRD, NodePrompt, Project
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
- [x] `project-onboarding.tsx` — 3 fixed steps (description, type, features) + 2-4 AI-generated dynamic questions
- [x] AI feature suggestions + tailored questions via `/api/ai/suggest-features` (single API call)
- [x] Skip button on all steps except description
- [x] Dynamic answers stored in `OnboardingAnswers.dynamicAnswers`
- [x] Summary page with "Start Planning" button, skipped answers shown as "Skipped"

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

## Phase 12: Landing Page & Route Restructure ✅

### 12.1 Route Groups
- [x] Create `app/(marketing)/` route group for public pages
- [x] Create `app/(app)/` route group for authenticated pages
- [x] Strip root `app/layout.tsx` to html/body/fonts only
- [x] `app/(app)/layout.tsx` — AuthProvider + Header + ErrorBoundary
- [x] `app/(marketing)/layout.tsx` — LandingNavBar + Footer
- [x] Move dashboard from `/` to `/dashboard`
- [x] Move login, project, share routes under `(app)` group
- [x] Update all auth redirects (`/` → `/dashboard`)
- [x] Update header logo link to `/dashboard`

### 12.2 Landing Page
- [x] `components/landing/nav-bar.tsx` — Sticky nav, transparent → blur on scroll, mobile hamburger
- [x] `components/landing/hero-section.tsx` — Split screen: headline + CTA / animated mockup
- [x] `components/landing/hero-mockup.tsx` — SVG/CSS animated canvas nodes + dashed edges
- [x] `components/landing/trust-bar.tsx` — "Station 8 Developed", "Pioneers VC Approved"
- [x] `components/landing/how-it-works.tsx` — 3-step workflow
- [x] `components/landing/features-grid.tsx` — 6-card feature showcase
- [x] `components/landing/cta-banner.tsx` — Full-width gradient CTA section
- [x] `components/landing/footer.tsx` — 4-column footer with social icons

### 12.3 Dashboard Loading & Persistence
- [x] `components/dashboard/dashboard-loader.tsx` — Animated loader (floating nodes, spinning compass)
- [x] `services/persistence.ts` — Runtime Firestore → localStorage failover via `withFallback()`

---

## The Big Vision: "Ralphy-Ready" PRD Pipeline

Ralphy is an autonomous AI coding loop — it takes a PRD (markdown checklist or JSON with user stories), hands it to an AI agent (Claude Code, Cursor, Codex, etc.), and loops until every task passes. The key insight for TinyBaguette is:

**TinyBaguette should be the PRD generation engine that feeds Ralphy.** The flow becomes:

1. User describes project → AI builds the DAG (goals → subgoals → features → tasks)
2. AI asks targeted questions about each node to gather requirements
3. TinyBaguette generates context-aware PRDs for each node that:
   - Know about sibling/parent/child PRDs in the hierarchy
   - Include what other PRDs exist in the ecosystem and their status
   - Reference the parent PRD for broader context
   - Are scoped small enough for one AI coding context window (Ralphy's key constraint)
   - Instruct the AI agent to use the Ralphy technique (`ralphy --prd PRD.md`)
4. User exports the PRD tree → runs ralphy → autonomous coding gets it done

---

## Phase 13: Design Tab — srcdoc Iframes (Replaced WebContainer) ✅

> **Rewritten Feb 22, 2026.** The Design tab was completely rewritten to eliminate WebContainer (required SharedArrayBuffer/COOP/COEP headers that fail on most hosts). Now uses `/api/ai/generate-pages` to generate standalone HTML with Tailwind CSS, rendered via `srcdoc` iframes. Works on all browsers.

### Status: ✅ Complete

- [x] AI reads project plan nodes → `/api/ai/generate-pages` → returns `ProjectPage[]` with HTML body
- [x] `wrapHtmlPage()` wraps body HTML in full document with Tailwind CDN
- [x] Two view modes: `designMode: 'single' | 'canvas'` (default: canvas)
- [x] Single mode: full-size iframe with viewport switcher (Desktop/Tablet/Mobile) + page sidebar
- [x] Canvas mode: React Flow with all pages as draggable `PageFrameNode` nodes (srcdoc iframes 1280×800 scaled to 420×320)
- [x] `PageChat` sidebar: select page → open chat → type instructions → `/api/ai/edit-page` updates HTML
- [x] Inline AI editing on canvas nodes: MessageSquare button → edit bar → AI edits page
- [x] Delete page: Trash2 button on each canvas node
- [x] Focus page: Maximize2 button switches to single-page view
- [x] Select page on canvas → auto-opens PageChat sidebar
- [x] Add Page dialog: name a page → AI generates matching HTML → added to canvas
- [x] Add Page button in canvas mode toolbar
- [x] **Agent drag-and-drop**: `AgentsPanel` (collapsible floating panel) with draggable agent cards
- [x] Green ring highlight on page nodes during drag-over
- [x] Drop agent → injects styled chat widget HTML (floating bubble + expandable chat panel)
- [x] Widget uses agent's name, primaryColor, greeting, position (bottom-left/bottom-right)
- [x] Pages, edges, and positions persisted in project store

### Legacy WebContainer Files (still in codebase, unused)
- `services/webcontainer.ts`, `hooks/use-webcontainer.ts`, `lib/webcontainer-template.ts`
- `lib/build-app-context.ts`, `lib/element-selector-script.ts`, `lib/parse-app-routes.ts`
- `prompts/app-generation.ts`, `prompts/app-edit.ts`
- `/api/ai/generate-app`, `/api/ai/edit-app`
- Dependencies: `@webcontainer/api`, `@monaco-editor/react`, `jszip`

---

## Phase 14: Advanced Canvas ✅

> Upgrade the Plan tab canvas with multi-select + bulk actions, level-of-detail zoom rendering, and spring physics layout.

### Phase A: Multi-Select + Bulk Actions ✅
- [x] `selectedNodeIds: Set<string>` + `toggleNodeSelection`, `setSelectedNodes`, `clearSelection` in UI store
- [x] `selectionOnDrag` rubber-band box select + `Shift` multi-select key in ReactFlow
- [x] Multi-select ring highlighting (blue dashed ring) across all 12 node types
- [x] Keyboard shortcuts: `Ctrl+A` select all, `Escape` clears multi-selection, `Delete` bulk delete, `Ctrl+D` bulk duplicate
- [x] `deleteNodes(ids[])` and `duplicateNodes(ids[])` bulk methods in project store
- [x] Bulk actions floating toolbar: Set Status, Align (8 options), Distribute H/V, Duplicate, Delete, Clear
- [x] Alignment helpers (`lib/canvas-align.ts`): alignTop/Middle/Bottom/Left/Center/Right, distributeH/V

### Phase B: Spring Physics Layout ✅
- [x] Force-directed layout engine (`lib/canvas-physics.ts`) — repulsion, edge attraction, hierarchy gravity, damping
- [x] Layout mode toggle in toolbar: Dagre (tree) vs Spring (force-directed) with `Atom` icon
- [x] `layoutMode: 'dagre' | 'spring'` in UI store
- [x] Spring layout wired into `graph-canvas.tsx` via `handleSpringLayout` callback

### Phase C: Level-of-Detail Zoom ✅
- [x] Zoom level hook (`hooks/use-zoom-level.ts`) — reads ReactFlow viewport zoom, returns LOD tier
- [x] 3 LOD tiers: `full` (≥0.6), `compact` (0.3–0.6), `dot` (<0.3)
- [x] `base-plan-node.tsx` renders progressively: full detail → title+status pill → tiny colored dot
- [x] Compact: 180×40px, status dot + truncated title only
- [x] Dot: 48×28px, colored pill with status dot, no text

---

## Phase 15: Territory File Sync ✅

> Bidirectional canvas ↔ Markdown file sync. Each node becomes a standalone Markdown file with YAML frontmatter. Export/import via File System Access API or downloadable bundle.

### File Format
- `.territory/project.yaml` — project metadata (title, description, phase) + dependency edges + team
- `.territory/goals/<id>.md` — one file per goal node
- `.territory/subgoals/<id>.md`, `features/<id>.md`, `tasks/<id>.md`, `docs/<id>.md`
- Each node file: YAML frontmatter (id, type, status, parent, priority, tags, decisions) + `# Title` + description + PRD/prompt sections

### Implementation
- [x] `lib/territory-serialize.ts` — `nodeToMarkdown()` / `markdownToNode()` round-trip, `projectToTerritory()` / `territoryToProject()` full project serialization, minimal YAML serializer/parser (zero dependencies), bundle format for download
- [x] `lib/territory-sync.ts` — `diffTerritoryToCanvas()` / `diffCanvasToTerritory()` diff engine, `applyMerge()` with selective accept, `NodeDiff` / `EdgeDiff` / `SyncDiff` types, field-level change detection
- [x] `hooks/use-territory-sync.ts` — React hook: export bundle download, export to folder (File System Access API), import from bundle file, import from folder, diff computation, selective merge apply
- [x] `components/canvas/territory-sync-panel.tsx` — UI panel: export/import buttons (bundle + folder), diff review with per-node accept/reject, summary badges (added/modified/removed/conflicts), file format info
- [x] `stores/project-store.ts` — `mergeFromTerritory(nodes, edges)` bulk merge method
- [x] `stores/ui-store.ts` — `territorySyncOpen` state + `setTerritorySyncOpen` action
- [x] `canvas-toolbar.tsx` — FolderSync icon button toggles territory sync panel
- [x] `project-workspace.tsx` — `Ctrl+T` keyboard shortcut for territory sync panel
- [x] TypeScript compiles clean

---

## Phase 16: Landing Page Refinement ✅

### 16.1 Canvas Toolbar & Node Cleanup
- [x] Remove Expand/Collapse all, Spring layout, Animated spring layout from `canvas-toolbar.tsx`
- [x] Remove Snap to grid, Blast radius from canvas toolbar
- [x] Remove Team button from `project-toolbar.tsx`
- [x] Click-to-expand/collapse child nodes in `base-plan-node.tsx`
- [x] Full title display on node selection
- [x] Start all nodes expanded by default
- [x] Widen nodes for longer titles (`constants.ts`)
- [x] Subtree background coloring (`subtree-backgrounds.tsx` + `graph-canvas.tsx` integration)

### 16.2 Planning Playground Theme Migration
- [x] Migrate `planning-playground.tsx` from dark theme to french-editorial parchment palette
- [x] Replace all 22 blue accent references with sage green (`#4A7459`, `#8BAF8A`, `#3a5e47`)
- [x] Remove `features-dark-override` CSS class
- [x] Update node fills, text colors, edges, dot grid, sidebar, email gate, all phases

### 16.3 Page Structure & Content
- [x] `page.tsx` — PlanningPlayground as hero (first section), HeroConversion removed from flow
- [x] `hero-conversion.tsx` — All French text translated to English
- [x] `nav-bar.tsx` — FR/EN language toggle button (desktop + mobile)
- [x] `features-tabs.tsx` + `interactive-showcase.tsx` — Tagline → "Plan your project in minutes."
- [x] `baguette-footer.tsx` — New footer component with large `Baguettepng.png` logo

### 16.4 Bug Fixes
- [x] SVG zoom fix — `preserveAspectRatio="xMidYMid meet"` replaces overflow scrolling
- [x] Baguette image — Committed to git, added `unoptimized` prop

---

## Phase 17: Smart Onboarding & Quick Questions ✅

### 17.1 Skip Button
- [x] Skip link between Back and Continue on all onboarding steps except description
- [x] Skipping clears step value and advances
- [x] Summary page shows "Skipped" in muted italic for skipped/empty answers
- [x] Skipped state clears if user revisits step and provides answer
- [x] `onboarding-message.ts` only includes non-empty answers

### 17.2 Dynamic AI-Generated Questions
- [x] Removed fixed steps 4-7 (audience, timeline, teamSize, priorities) from `onboarding-config.ts`
- [x] Added `DynamicOnboardingQuestion` interface to `onboarding-config.ts`
- [x] Made `audience`, `timeline`, `teamSize`, `priorities` optional in `OnboardingAnswers`
- [x] Added `dynamicAnswers?: Record<string, string | string[]>` to `OnboardingAnswers`
- [x] Extended `featureSuggestionsSchema` with `tailoredQuestions` array (id, question, subtitle, type, options)
- [x] Updated `/api/ai/suggest-features` prompt to generate 2-4 tailored domain-specific questions
- [x] Single API call returns both features and questions -- no extra latency
- [x] Dynamic questions render as additional steps after features with existing option grid UI
- [x] Summary page shows all steps (fixed + dynamic)
- [x] `onboarding-message.ts` formats dynamic answers

### 17.3 Quick Questions Panel
- [x] `components/panels/quick-questions-panel.tsx` -- slide-in panel from right (w-80)
- [x] Progress bar: "X/Y questions answered" with percentage
- [x] Nodes with unanswered questions grouped by node (type badge + title)
- [x] Expandable groups with inline option buttons for answering
- [x] "Generate questions" button for nodes without any (calls `/api/ai/generate-questions`)
- [x] `quickQuestionsPanelOpen` state in `ui-store.ts`
- [x] HelpCircle button with unanswered count badge in `canvas-toolbar.tsx`
- [x] Panel rendered in `project-workspace.tsx`
- [x] Extended ICON_MAP with 15+ additional Lucide icons for AI-generated question options

---

## Phase 18: Landing Page Feedback Fixes ✅

### 18.1 Copy Clarity
- [x] Hero subtitle rewritten: "Describe your app or website idea..." (clarifies software context)
- [x] Badge updated: "From idea to dev-ready plan in minutes"
- [x] Removed all em dashes from user-facing landing page copy

### 18.2 Calmer Showcase Animations
- [x] Removed auto-cycling `setInterval` from `CanvasDemo` (pre-selects one node statically)
- [x] Removed auto-cycling `setInterval` from `TableDemo` (pre-selects one row statically)
- [x] Removed auto-cycling `setInterval` from `GanttDemo` (pre-selects one task statically)
- [x] Removed auto-cycling `setInterval` from `PRDDemo` (typewriter still runs on initial load)
- [x] Removed tab auto-rotation from `InteractiveShowcase`

### 18.3 Less Aggressive Email Gate
- [x] `ACTION_LIMIT` increased from 10 → 25 (users get ~25 interactions before gate)
- [x] Gate overlay delay increased from 400ms → 3000ms
- [x] Added "Maybe later" dismiss button to `EmailGateOverlay` (gives 5 more actions)
- [x] Added `onDismiss` / `onDismissGate` prop chain through `InteractiveCanvas`

### 18.4 Return to Plan After Email
- [x] Post-email "You're In!" screen now shows "← View your plan" button alongside "Plan another →"
- [x] Clicking "View your plan" returns to canvas phase with plan data intact

---

## Consolidated Task List

### 🔴 CORE — PRD Pipeline ✅

- [x] **Deep question flow per node** — Category-aware questions, multi-turn follow-ups, readiness badge, expanded to goal/subgoal/feature/task
- [x] **Context-aware PRD generation** — `buildPrdEcosystem()` gives each PRD parent/sibling/child/dependency PRD context
- [x] **PRD scoping for Ralphy** — feature/task PRDs get mandatory Implementation Checklist + Run with Ralphy block; goal/subgoal get summary PRDs
- [x] **Ralphy export format** — ZIP with `prd/*.md`, `.ralphy/config.yaml`, flat `PRD.md`; also "PRD Manifest (.md)" quick export
- [x] **Ralphy instructions in PRDs** — Every feature/task PRD includes `## Run with Ralphy` block with invoke command, agent rec, complexity, boundary
- [x] **PRD status tracking** — Pipeline panel with per-node status dots (needs_questions → answering → ready → generated/stale → export_ready), stale detection on answer change

### 🟡 INFRASTRUCTURE — Pending Items

- [ ] **Email infrastructure** — Set up email receiving at `hello@tinybaguette.com` (Cloudflare Email Routing or ImprovMX)
- [x] **Email storage** — Hero prompt email capture → Firestore `waitlist` collection; optional Resend welcome email via `RESEND_API_KEY`
- [x] **Privacy Policy / Terms of Service** — Pages at `/privacy` and `/terms`, footer links wired
- [x] **Cleanup** — Deleted 10 dead code files: `hero-section.tsx`, `view-switcher.tsx`, `timeline-bar.tsx`, 2 collaboration components, `activity-feed.tsx`, `use-collaboration.ts`, 3 integration services (github, linear, slack)

### 🟢 KNOWN ISSUES

- [x] **API route auth** — `middleware.ts` enforces Authorization header on `/api/*` when Firebase is configured; `lib/auth-fetch.ts` sends tokens from frontend
- [x] **Base64 image bloat** — Images > 5MB rejected, images > 1MB auto-compressed via canvas (max 1200px, JPEG 0.8 quality)
- [x] **`changeNodeType` hierarchy validation** — Validates parent compatibility and children compatibility before allowing type change
- [x] **Share page routing** — Moved to `(marketing)` route group (publicly accessible without auth)
- [x] ~~**Dead code** — `refinement-system.ts` unused~~ — Actually used by `planning-chat.tsx` and `refinement-question-card.tsx`

### 🔵 POST v1.0

- [x] Pluggable collaboration provider (local mock)
- [x] Presence avatars + live cursors (local mock)
- [ ] **Real-time collaboration** — WebSocket backend (PartyKit/Liveblocks)
- [ ] **OAuth integration flows** — Server-side GitHub/Slack/Linear OAuth
- [x] **Territory file sync** — Bidirectional canvas ↔ Markdown
- [x] **Advanced canvas** — Spring physics, multi-select, level-of-detail zoom
- [x] **Image compression** — Resize/compress base64 before storing (canvas-based, > 1MB threshold)

---

## Notes

- Firebase is optional — all env vars guarded at init; runtime failover to localStorage
- Route groups: `(marketing)` public (incl. share page), `(app)` authenticated; root layout is minimal
- API routes protected by `middleware.ts` (checks Authorization header when Firebase is configured); `lib/auth-fetch.ts` sends Firebase ID tokens from frontend
- Landing page is public at `/`; dashboard at `/dashboard`
- Images stored as base64 data URLs (no external storage needed); auto-compressed above 1MB, rejected above 5MB
- PRDs and prompts designed for copy-paste into IDE workflows
- Smart mapping uses `PARENT_TYPE_MAP` hierarchy + Euclidean distance
- Typed edges: `blocks` (red dashed, animated), `depends_on` (blue dashed)
- Blast radius traverses children + dependency edges recursively
- Export supports 7 formats: JSON, Full Plan MD, Tasks MD, .cursorrules, CLAUDE.md, plan.md, tasks.md
- Markdown import maps heading levels: # → goal, ## → subgoal, ### → feature, #### → task
- 3 seed templates available: SaaS Auth, REST API, Landing Page
- Animated dashboard loader with floating nodes and spinning compass icon
