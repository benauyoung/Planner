# VisionPath Implementation Plan

> The living checklist. Only place where task status is tracked. Update immediately on completion.

---

## Status Legend

- `[ ]` Pending
- `[~]` In Progress
- `[x]` Completed
- `[!]` Blocked

---

## Phase 1: Foundation

### 1.1 Project Structure
- [ ] Create `app/` directory with layout.tsx and page.tsx
- [ ] Create `app/globals.css` with Tailwind imports and CSS variables
- [ ] Create `components/` directory structure
- [ ] Create `lib/` directory for utilities
- [ ] Create `stores/` directory for Zustand
- [ ] Create `types/` directory for TypeScript interfaces
- [ ] Create `territory/` output folder

### 1.2 Type Definitions
- [ ] `types/node.ts` - VisionNode, NodeType, NodeStatus, PlanItem
- [ ] `types/edge.ts` - VisionEdge, EdgeStatus
- [ ] `types/canvas.ts` - CanvasState, Viewport
- [ ] `types/index.ts` - Re-export all types

### 1.3 Zustand Stores
- [ ] `stores/canvasStore.ts` - Nodes, edges, selection, viewport
- [ ] `stores/panelStore.ts` - Active panel, edit mode
- [ ] `stores/chatStore.ts` - Per-node chat history
- [ ] `stores/syncStore.ts` - File watcher state, sync status

### 1.4 Dependencies
- [ ] Install d3-force and @types/d3-force
- [ ] Install chokidar
- [ ] Install yjs and y-partykit
- [ ] Install gray-matter (YAML frontmatter parsing)
- [ ] Verify existing deps work (react-flow, zustand, etc.)

---

## Phase 2: Visual Canvas

### 2.1 Canvas Component
- [ ] `components/canvas/Canvas.tsx` - React Flow wrapper
- [ ] Configure dark theme (background, node colors)
- [ ] Add grid background with dots
- [ ] Add pan/zoom controls
- [ ] Add minimap component

### 2.2 Custom Nodes
- [ ] `components/nodes/BaseNode.tsx` - Shared wrapper with status indicator
- [ ] `components/nodes/GoalNode.tsx` - Large, primary color
- [ ] `components/nodes/SubgoalNode.tsx` - Medium, secondary color
- [ ] `components/nodes/FeatureNode.tsx` - Standard, accent color
- [ ] `components/nodes/TaskNode.tsx` - Small, muted color
- [ ] `components/nodes/index.ts` - Export nodeTypes object

### 2.3 Custom Edges
- [ ] `components/edges/DependencyEdge.tsx` - Animated cable
- [ ] Visual states: pending (gray), active (blue), complete (green), blocked (red)
- [ ] Arrow markers for direction

### 2.4 Spring Physics
- [ ] `lib/physics.ts` - d3-force simulation setup
- [ ] Node repulsion force (prevent overlap)
- [ ] Edge spring attraction (connected nodes cluster)
- [ ] Damping for stable positions
- [ ] Integration with React Flow onNodesChange
- [ ] Pause physics during manual drag
- [ ] Resume physics on drag end

### 2.5 Node Interactions
- [ ] Click to select (update canvasStore)
- [ ] Shift+click for multi-select
- [ ] Double-click to open panel
- [ ] Right-click context menu
- [ ] Drag to reposition

---

## Phase 3: Drill-Down Panels

### 3.1 Panel Container
- [ ] `components/panels/PanelContainer.tsx` - Slide-out wrapper
- [ ] Tab navigation: Plan | Chat | Details
- [ ] Close button
- [ ] Resize handle

### 3.2 Plan Panel
- [ ] `components/panels/PlanPanel.tsx` - Main component
- [ ] Markdown renderer (react-markdown)
- [ ] Interactive checkboxes (click to toggle)
- [ ] Edit mode toggle
- [ ] Live preview while editing
- [ ] Save button (updates node and syncs to file)

### 3.3 Chat Panel
- [ ] `components/panels/ChatPanel.tsx` - Chat interface
- [ ] Message list with user/assistant bubbles
- [ ] Input field with send button
- [ ] Streaming response display
- [ ] Context indicator (shows upstream nodes used)

### 3.4 Details Panel
- [ ] `components/panels/DetailsPanel.tsx` - Metadata view
- [ ] Node type, status, created/updated dates
- [ ] File path (linked to territory)
- [ ] Upstream/downstream dependency list
- [ ] Delete node button (with confirmation)

---

## Phase 4: AI Integration

### 4.1 Context Management
- [ ] `lib/ai-context.ts` - buildNodeContext function
- [ ] Traverse upstream nodes via edges
- [ ] Format context as structured Markdown
- [ ] Token counting (estimate)
- [ ] Truncation if exceeds limit

### 4.2 System Prompts
- [ ] `lib/ai-prompts.ts` - Per-node-type prompts
- [ ] Goal prompt (break into subgoals)
- [ ] Subgoal prompt (identify features)
- [ ] Feature prompt (list tasks, technical reqs)
- [ ] Task prompt (implementation details)

### 4.3 API Route
- [ ] `app/api/ai/route.ts` - Gemini integration
- [ ] POST handler with streaming
- [ ] Error handling (rate limits, API errors)
- [ ] Request validation

### 4.4 AI Actions
- [ ] "Decompose" action - Break node into children
- [ ] "Plan" action - Generate checklist for node
- [ ] "Review" action - Check plan completeness
- [ ] UI buttons for each action in ChatPanel

---

## Phase 5: Territory Sync

### 5.1 File Structure
- [ ] Create initial territory/ folder structure
- [ ] README.md, VISION.md, ARCHITECTURE.md templates
- [ ] SPEC_DEFS/ folder
- [ ] LOGS/ folder

### 5.2 Serialization
- [ ] `lib/territory.ts` - Core sync functions
- [ ] `nodeToMarkdown(node)` - Serialize with YAML frontmatter
- [ ] `markdownToNode(content, filePath)` - Parse back to node
- [ ] `formatPlan(items)` - Convert PlanItem[] to Markdown checkboxes
- [ ] `parsePlan(markdown)` - Extract PlanItem[] from Markdown

### 5.3 File Watcher
- [ ] `lib/file-watcher.ts` - Chokidar setup
- [ ] Watch territory/ directory
- [ ] On file change: read, parse, update store
- [ ] Debounce rapid changes (500ms)
- [ ] Ignore changes from our own writes

### 5.4 Write Sync
- [ ] On node update: serialize and write to file
- [ ] Debounce writes (500ms)
- [ ] Handle new nodes (create file)
- [ ] Handle deleted nodes (optionally delete file or mark)

### 5.5 Conflict Resolution
- [ ] Compare timestamps (file mtime vs node.updatedAt)
- [ ] If conflict: show modal with options
- [ ] "Keep Canvas" / "Keep File" / "Merge (if possible)"
- [ ] Merge logic for plan checkboxes (union)

---

## Phase 6: Advanced Features

### 6.1 Dependency Validation
- [ ] `lib/validation.ts` - Cycle detection
- [ ] `wouldCreateCycle(source, target, edges)` function
- [ ] Block edge creation if cycle detected
- [ ] Visual feedback (red highlight on invalid drop)

### 6.2 Blocked Status
- [ ] `updateBlockedStatus(nodes, edges)` function
- [ ] Propagate blocked status when parent incomplete
- [ ] Visual indicator on blocked nodes (red border or icon)

### 6.3 Auto-Layout
- [ ] `lib/layout.ts` - Dagre integration
- [ ] "Organize" button in toolbar
- [ ] Horizontal left-to-right flow
- [ ] Preserve manual positions as override option

### 6.4 Level of Detail (LOD)
- [ ] Zoom threshold for hiding task nodes
- [ ] Collapse/expand clusters
- [ ] Focus mode (dim unrelated nodes)

---

## Phase 7: Real-Time Collaboration

### 7.1 Yjs Setup
- [ ] `lib/collaboration.ts` - Y.Doc initialization
- [ ] Y.Map for nodes
- [ ] Y.Map for edges
- [ ] IndexedDB persistence (offline support)

### 7.2 PartyKit Integration
- [ ] Create PartyKit project (`npx partykit init`)
- [ ] `party/index.ts` - Server code
- [ ] WebSocket connection from client
- [ ] Room-based sync (one room per project)

### 7.3 Zustand-Yjs Bridge
- [ ] Sync canvasStore changes to Y.Maps
- [ ] Observe Y.Map changes, update canvasStore
- [ ] Handle initial state reconciliation

### 7.4 Presence & Awareness
- [ ] User cursor positions
- [ ] "User X is viewing Node Y" tooltip
- [ ] Color-coded user indicators
- [ ] User list in header

### 7.5 Conflict UI
- [ ] "External change detected" toast
- [ ] Highlight nodes changed by others
- [ ] Merge indicator for simultaneous edits

---

## Phase 8: Polish & UX

### 8.1 Keyboard Shortcuts
- [ ] `Space` - Toggle pan mode
- [ ] `Tab` - Add child node to selected
- [ ] `Enter` - Open panel for selected
- [ ] `Backspace/Delete` - Delete selected
- [ ] `Cmd/Ctrl + S` - Force sync
- [ ] `Escape` - Close panel, deselect
- [ ] `Cmd/Ctrl + Z` - Undo
- [ ] `Cmd/Ctrl + Shift + Z` - Redo

### 8.2 Animations
- [ ] Panel slide-in/out (Framer Motion)
- [ ] Node expand/collapse
- [ ] Edge connection animation
- [ ] Status change pulse

### 8.3 Toolbar
- [ ] Add Goal button
- [ ] Add Feature button
- [ ] Add Task button
- [ ] Organize (auto-layout) button
- [ ] Zoom controls
- [ ] Sync status indicator

### 8.4 Persistence
- [ ] LocalStorage for viewport position
- [ ] Export canvas as JSON
- [ ] Import canvas from JSON
- [ ] Session recovery on crash

### 8.5 Onboarding
- [ ] Empty state with "Create your first Goal"
- [ ] Tooltip hints for new users
- [ ] Sample project template

---

## Testing Checklist

### Unit Tests
- [ ] `lib/validation.test.ts` - Cycle detection
- [ ] `lib/physics.test.ts` - Force calculations
- [ ] `lib/territory.test.ts` - Serialization round-trip
- [ ] `stores/canvasStore.test.ts` - State mutations

### Component Tests
- [ ] Node components render correctly
- [ ] Panel interactions work
- [ ] Context menu actions fire

### Integration Tests
- [ ] End-to-end: Create node → Edit plan → Save → Check file
- [ ] Collaboration: Two clients sync correctly
- [ ] AI: Chat produces valid response

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] PartyKit deployed
- [ ] Vercel project created
- [ ] Domain configured
- [ ] Analytics added (optional)

---

## Notes

*Add implementation notes, blockers, or decisions here as work progresses.*
