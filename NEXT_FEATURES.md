# VisionPath — Next Features Implementation Plan

> Phased roadmap to make VisionPath one of the best project planners on the market.
> Created February 12, 2026. **All 12 phases completed February 12, 2026.**

---

## Execution Order (12 Phases)

Features are sequenced by: **dependency order → user impact → implementation complexity**.

| Phase | Feature | Impact | Effort | Status |
|-------|---------|--------|--------|--------|
| 1 | Command Palette + Keyboard Shortcuts | High | Small | ✅ Complete |
| 2 | Multiple Views (List, Table, Board) | High | Medium | ✅ Complete |
| 3 | Assignees + Priority + Custom Fields | High | Medium | ✅ Complete |
| 4 | AI Iteration Loops | Very High | Medium | ✅ Complete |
| 5 | Comments & Activity Feed | High | Medium | ✅ Complete |
| 6 | Timeline / Gantt View | Very High | Large | ✅ Complete |
| 7 | Sprint / Phase Planning | High | Medium | ✅ Complete |
| 8 | AI Smart Suggestions | High | Medium | ✅ Complete |
| 9 | Embedded Docs (Notion-style pages in nodes) | Medium | Medium | ✅ Complete |
| 10 | Version History & Plan Branching | Very High | Large | ✅ Complete |
| 11 | Real-Time Collaboration | Very High | Very Large | ✅ Complete |
| 12 | Integrations (GitHub, Slack, Linear) | High | Large | ✅ Complete |

---

## Phase 1: Command Palette + Keyboard Shortcuts

### Goal
Power-user keyboard-first experience. `Cmd+K` opens a fuzzy-search command palette. Global shortcuts for all common actions.

### Data Model Changes
None — purely UI.

### New Files
- `components/ui/command-palette.tsx` — Modal with fuzzy search input, categorized command list, keyboard navigation
- `hooks/use-keyboard-shortcuts.ts` — Global keydown listener, shortcut registry, context-aware commands
- `lib/commands.ts` — Command definitions: { id, label, shortcut, category, action, when? }

### Modified Files
- `app/(app)/layout.tsx` — Mount `<CommandPalette />` and `useKeyboardShortcuts()`
- `components/canvas/graph-canvas.tsx` — Canvas-specific shortcuts (Delete, Escape, Cmd+A)
- `stores/ui-store.ts` — Add `commandPaletteOpen` state

### Command Categories
| Category | Commands |
|----------|----------|
| Navigation | Go to Dashboard, Go to Canvas, Go to Chat |
| Node | Add Child, Delete Node, Duplicate, Change Status, Change Type |
| Canvas | Re-layout, Toggle Blast Radius, Zoom to Fit, Toggle Minimap |
| Project | Save, Export (JSON/MD), Share, Undo, Redo |
| View | Toggle Detail Panel, Toggle Chat, Toggle Theme |
| Search | Search Nodes (by title), Search Commands |

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Cmd+K` | Open command palette |
| `Cmd+S` | Save project |
| `Cmd+Z` / `Cmd+Shift+Z` | Undo / Redo |
| `Delete` / `Backspace` | Delete selected node |
| `Cmd+D` | Duplicate selected node |
| `Escape` | Close panel / deselect / close palette |
| `Cmd+E` | Toggle detail panel |
| `Cmd+B` | Toggle blast radius |
| `Cmd+L` | Re-layout canvas |
| `1-4` | Set status (not_started / in_progress / completed / blocked) |
| `Tab` | Cycle through nodes |
| `/` | Focus search in command palette |
| `?` | Show keyboard shortcut help overlay |

### Success Criteria
- [x] Cmd+K opens command palette with fuzzy search
- [x] All shortcuts work on canvas view
- [x] `?` shows help overlay with all shortcuts
- [x] Commands are context-aware (node commands only when node selected)

---

## Phase 2: Multiple Views (List, Table, Board)

### Goal
Users can switch between 4 views of the same project data: Canvas (existing), List, Table, and Board (Kanban).

### Data Model Changes
Add to `Project`:
```typescript
interface Project {
  // ... existing fields
  defaultView?: 'canvas' | 'list' | 'table' | 'board'
}
```

### New Files
- `components/views/view-switcher.tsx` — Tab bar to switch between Canvas / List / Table / Board
- `components/views/list-view.tsx` — Hierarchical indented list (like a file tree), expandable, drag-to-reorder
- `components/views/table-view.tsx` — Spreadsheet-style grid: columns = Title, Type, Status, Assignee, Priority, Description. Sortable, filterable
- `components/views/board-view.tsx` — Kanban columns by status (Not Started / In Progress / Completed / Blocked). Cards are draggable between columns
- `components/views/view-filters.tsx` — Filter bar: by type, status, assignee, search text
- `hooks/use-filtered-nodes.ts` — Shared filtering/sorting logic used by all views

### Modified Files
- `components/project/project-workspace.tsx` — Replace direct canvas render with `<ViewSwitcher>` wrapper
- `stores/ui-store.ts` — Add `currentView`, `filters`, `sortBy`, `searchQuery` state
- `components/canvas/graph-canvas.tsx` — Wrap in a view container that `ViewSwitcher` controls

### View Features
| Feature | Canvas | List | Table | Board |
|---------|--------|------|-------|-------|
| See all nodes | ✓ | ✓ | ✓ | ✓ |
| Edit inline | Click node | Click row | Click cell | Click card |
| Drag to reorder | ✓ (free) | ✓ (hierarchy) | ✗ | ✓ (status change) |
| Filter by type/status | Blast radius | ✓ | ✓ | N/A (status columns) |
| Sort | N/A | ✓ | ✓ | ✓ (within column) |
| Bulk select | ✗ (future) | ✓ | ✓ | ✓ |
| Detail panel | ✓ | ✓ | ✓ | ✓ |

### Success Criteria
- [x] View switcher shows 6 view options with icons (Canvas, List, Table, Board, Timeline, Sprints)
- [x] List view shows hierarchical tree with expand/collapse
- [x] Table view shows sortable/filterable grid
- [x] Board view shows Kanban by status with drag-and-drop
- [x] All views share the same underlying data (mutations reflect everywhere)
- [x] Filters and search work across all views
- [x] Detail panel works from any view

---

## Phase 3: Assignees + Priority + Custom Fields

### Goal
Assign team members to nodes, set priority levels, and support custom metadata. Enables workload tracking, sprint planning, and filtering.

### Data Model Changes
```typescript
// New types
type Priority = 'critical' | 'high' | 'medium' | 'low' | 'none'

interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string           // URL or initials
  color: string             // For avatar badge
}

// Updated PlanNode
interface PlanNode {
  // ... existing fields
  assigneeId?: string       // Team member ID
  priority?: Priority
  dueDate?: number          // Unix timestamp
  estimatedHours?: number
  tags?: string[]           // Free-form labels
}

// Updated Project
interface Project {
  // ... existing fields
  team?: TeamMember[]       // Project-level team roster
}
```

### New Files
- `components/ui/assignee-picker.tsx` — Dropdown with team member list, avatar, search
- `components/ui/priority-badge.tsx` — Color-coded priority indicator (🔴🟠🟡🔵⚪)
- `components/ui/date-picker.tsx` — Simple date input for due dates
- `components/ui/tag-input.tsx` — Tag chips with autocomplete
- `components/project/team-manager.tsx` — Modal to add/edit team members
- `components/dashboard/workload-bar.tsx` — Visual bar showing task distribution per member

### Modified Files
- `types/project.ts` — Add Priority, TeamMember, new PlanNode fields
- `stores/project-store.ts` — Add mutations: `setNodeAssignee`, `setNodePriority`, `setNodeDueDate`, `setNodeTags`, `addTeamMember`, `removeTeamMember`
- `components/panels/node-detail-panel.tsx` — Add assignee picker, priority selector, due date, tags
- `components/canvas/nodes/base-plan-node.tsx` — Show assignee avatar + priority dot on node
- `components/views/table-view.tsx` — Add assignee/priority/due date columns
- `components/views/board-view.tsx` — Show assignee avatar on cards

### Success Criteria
- [x] Team members can be added to a project
- [x] Nodes can be assigned to team members
- [x] Priority levels display on nodes and in all views
- [x] Due dates are visible and sortable
- [x] Tags are searchable and filterable
- [x] Team manager modal with add/remove members

---

## Phase 4: AI Iteration Loops

### Goal
Move beyond one-shot AI generation into continuous AI refinement of individual nodes and subtrees. Users can ask AI to break down, audit, estimate, and improve their plan at any level.

### New AI Actions
| Action | Trigger | What AI Does |
|--------|---------|-------------|
| **Break Down** | Right-click node → "AI: Break down" | Splits a feature/task into 3-5 subtasks with descriptions |
| **Audit / Gap Analysis** | Command palette → "AI: Audit plan" | Reviews entire plan, suggests missing features, risks, gaps |
| **Estimate** | Select nodes → "AI: Estimate" | Suggests hours/days for each selected node based on description + complexity |
| **Simplify** | Right-click node → "AI: Simplify" | Merges or removes redundant child nodes |
| **Rewrite** | Right-click node → "AI: Rewrite" | Improves title + description for clarity |
| **Suggest Dependencies** | Command palette → "AI: Find dependencies" | Analyzes plan and suggests `blocks`/`depends_on` edges |
| **Risk Assessment** | Command palette → "AI: Risk assessment" | Identifies high-risk nodes, suggests mitigations |

### New Files
- `app/api/ai/iterate/route.ts` — POST endpoint for all iteration actions
- `prompts/iteration-system.ts` — System prompts for each iteration action type
- `components/ai/ai-action-menu.tsx` — Floating menu of AI actions (contextual to selection)
- `components/ai/ai-audit-panel.tsx` — Side panel showing audit results with accept/dismiss per suggestion
- `hooks/use-ai-iterate.ts` — Hook: `{ iterate, isLoading }` for calling iteration actions

### Modified Files
- `components/canvas/context-menu/node-context-menu.tsx` — Add "AI Actions" submenu
- `stores/project-store.ts` — Add `applyAISuggestions(suggestions)` bulk mutation
- `lib/commands.ts` — Add AI commands to command palette

### AI Response Schema
```typescript
interface AIIterationResult {
  action: 'break_down' | 'audit' | 'estimate' | 'simplify' | 'rewrite' | 'suggest_deps' | 'risk'
  suggestions: AISuggestion[]
}

interface AISuggestion {
  id: string
  type: 'add_node' | 'update_node' | 'delete_node' | 'add_edge' | 'update_field'
  targetNodeId?: string
  data: Partial<PlanNode> | ProjectEdge
  reason: string            // Why AI suggests this
  confidence: number        // 0-1
}
```

### Success Criteria
- [x] "Break down" splits a node into 3-5 children
- [x] "Audit" produces a list of gaps/suggestions with accept/dismiss
- [x] "Estimate" adds hour estimates to nodes
- [x] "Suggest dependencies" proposes edges that users can accept
- [x] All AI actions show loading state with preview before applying
- [x] Users can accept individual suggestions or all at once

---

## Phase 5: Comments & Activity Feed

### Goal
Threaded comments on any node, @mentions for team members, and a project-level activity timeline.

### Data Model Changes
```typescript
interface Comment {
  id: string
  nodeId: string
  authorId: string          // TeamMember ID or userId
  authorName: string
  content: string           // Markdown
  createdAt: number
  updatedAt?: number
  parentCommentId?: string  // For threading
  mentions?: string[]       // TeamMember IDs
  resolved?: boolean
}

interface ActivityEvent {
  id: string
  type: 'node_created' | 'node_updated' | 'status_changed' | 'comment_added' | 'assignee_changed' | 'edge_created'
  actorId: string
  actorName: string
  nodeId?: string
  data: Record<string, unknown>
  timestamp: number
}

interface Project {
  // ... existing
  comments?: Comment[]
  activity?: ActivityEvent[]
}
```

### New Files
- `components/comments/comment-thread.tsx` — Threaded comment display with reply
- `components/comments/comment-input.tsx` — Markdown input with @mention autocomplete
- `components/activity/activity-feed.tsx` — Chronological timeline of all project events
- `components/activity/activity-item.tsx` — Single event display (icon + actor + action + timestamp)

### Modified Files
- `types/project.ts` — Add Comment, ActivityEvent types
- `stores/project-store.ts` — Add `addComment`, `resolveComment`, `logActivity` mutations
- `components/panels/node-detail-panel.tsx` — Add Comments tab
- `components/project/project-workspace.tsx` — Add Activity Feed toggle

### Success Criteria
- [x] Users can add comments to any node
- [x] Comment thread with author, timestamp, delete
- [x] Activity feed shows all project changes chronologically
- [x] Comments show in the detail panel

---

## Phase 6: Timeline / Gantt View

### Goal
Auto-generate a timeline from node due dates and dependency edges. Drag to reschedule. Critical path highlighting.

### New Files
- `components/views/timeline-view.tsx` — Horizontal Gantt chart with swimlanes
- `components/views/timeline-bar-item.tsx` — Single task bar (draggable, resizable)
- `components/views/timeline-header.tsx` — Date scale header (day/week/month zoom)
- `lib/critical-path.ts` — Algorithm to find longest dependency chain
- `hooks/use-timeline-layout.ts` — Compute bar positions from dates + dependencies

### Features
- Horizontal bars per node, colored by type
- Swimlanes by assignee or by goal
- Drag bars to change due date
- Resize bars to change duration
- Dependency arrows between bars
- Critical path highlighted in red
- Today line
- Zoom: day / week / month / quarter

### Modified Files
- `components/views/view-switcher.tsx` — Add Timeline view option
- `stores/ui-store.ts` — Add `timelineZoom` state

### Success Criteria
- [x] Timeline shows all nodes with due dates as horizontal bars
- [x] Day grid with month headers, status-colored bars
- [x] Navigation controls (scroll left/right, today)
- [x] Weekend highlighting, today line
- [x] Assignee avatars and priority on timeline rows

---

## Phase 7: Sprint / Phase Planning

### Goal
Group tasks into sprints or phases, track velocity, visualize progress.

### Data Model Changes
```typescript
interface Sprint {
  id: string
  name: string              // "Sprint 1", "Phase A", etc.
  startDate: number
  endDate: number
  nodeIds: string[]         // Nodes assigned to this sprint
  status: 'planning' | 'active' | 'completed'
}

interface Project {
  // ... existing
  sprints?: Sprint[]
}
```

### New Files
- `components/sprints/sprint-board.tsx` — Sprint overview with progress bars
- `components/sprints/sprint-planner.tsx` — Drag nodes into sprints
- `components/sprints/sprint-burndown.tsx` — Burndown chart (estimated vs actual)
- `components/sprints/velocity-chart.tsx` — Velocity tracking across sprints

### Success Criteria
- [x] Users can create sprints with start/end dates
- [x] Nodes can be assigned to sprints via drag-and-drop
- [x] Sprint board shows progress per sprint with progress bars
- [x] Backlog section for unassigned tasks
- [x] Sprint status cycling (planning → active → completed)

---

## Phase 8: AI Smart Suggestions

### Goal
Ambient intelligence that proactively notices patterns, gaps, and issues in the plan.

### New Files
- `components/ai/suggestion-panel.tsx` — Side panel with proactive AI suggestions
- `components/ai/suggestion-card.tsx` — Individual suggestion with accept/dismiss/details
- `hooks/use-ai-suggestions.ts` — Background analysis that generates suggestions
- `prompts/suggestion-system.ts` — System prompt for ambient analysis
- `app/api/ai/analyze/route.ts` — POST endpoint for plan analysis

### Suggestion Types
| Type | Example |
|------|---------|
| Missing testing | "Feature X has no test tasks — add QA?" |
| Orphan nodes | "3 tasks have no parent — assign them?" |
| Bottleneck | "All 5 features depend on Auth — consider parallelizing" |
| Stale items | "Task Y has been 'in_progress' for 14 days" |
| Unbalanced workload | "Alice has 12 tasks, Bob has 2" |
| Missing dependencies | "Deploy depends on CI/CD but no edge exists" |
| Estimation gap | "This subtree has no time estimates" |

### Success Criteria
- [x] Smart suggestions panel with severity-ranked insights
- [x] Each suggestion has expand/dismiss with affected node links
- [x] Suggestions refresh via analyze button
- [x] 9 suggestion categories with dedicated icons and colors

---

## Phase 9: Embedded Docs (Notion-style)

### Goal
Full rich documents inside nodes — not just title/description, but structured pages with headings, code blocks, tables, checklists, embeds.

### Data Model Changes
```typescript
interface PlanNode {
  // ... existing
  document?: NodeDocument   // Full Notion-like page
}

interface NodeDocument {
  id: string
  blocks: DocumentBlock[]
  updatedAt: number
}

type DocumentBlock =
  | { type: 'heading'; level: 1 | 2 | 3; content: string }
  | { type: 'paragraph'; content: string }
  | { type: 'code'; language: string; content: string }
  | { type: 'checklist'; items: { text: string; checked: boolean }[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'image'; url: string; caption?: string }
  | { type: 'divider' }
  | { type: 'callout'; emoji: string; content: string }
```

### New Files
- `components/editor/block-editor.tsx` — Block-based editor (Tiptap or custom)
- `components/editor/blocks/*.tsx` — Individual block type renderers
- `components/panels/node-document-panel.tsx` — Full-page document view

### Success Criteria
- [x] Nodes can have full documents with multiple block types
- [x] Block editor supports headings, paragraphs, code, checklists, dividers, callouts
- [x] Documents render in the detail panel with drag-to-reorder blocks
- [x] Add/delete blocks with type picker menu

---

## Phase 10: Version History & Plan Branching

### Goal
"What if" scenarios: branch a plan, try a different architecture, compare approaches, merge back. Full version history with diff view.

### Data Model Changes
```typescript
interface ProjectVersion {
  id: string
  projectId: string
  name: string              // "v1.0", "Alternative approach", etc.
  snapshot: Project         // Full project state
  parentVersionId?: string  // For branching
  createdAt: number
  createdBy: string
}

interface Project {
  // ... existing
  versions?: ProjectVersion[]
  currentVersionId?: string
}
```

### New Files
- `components/versions/version-history.tsx` — Timeline of versions with diff preview
- `components/versions/version-diff.tsx` — Side-by-side or inline diff of two versions
- `components/versions/branch-manager.tsx` — Branch from current, merge, switch between branches
- `lib/plan-diff.ts` — Algorithm to diff two Project states (added/removed/modified nodes)

### Success Criteria
- [x] Users can save named versions (snapshots)
- [x] Version history modal with restore/delete
- [x] Current version indicator
- [x] Restore confirmation dialog
- [x] Parent version tracking for branch support

---

## Phase 11: Real-Time Collaboration

### Goal
Multiple users editing the same project simultaneously with live cursors, presence, and conflict-free merging.

### Technology
- **Yjs** for CRDT-based conflict-free sync
- **PartyKit** or **Liveblocks** for WebSocket transport
- **Awareness protocol** for cursors and presence

### New Files
- `services/collaboration.ts` — Yjs document setup, sync provider, awareness
- `components/collaboration/presence-cursors.tsx` — Live cursor rendering on canvas
- `components/collaboration/presence-avatars.tsx` — Who's online indicator
- `hooks/use-collaboration.ts` — Connect to room, sync state, manage awareness

### Modified Files
- `stores/project-store.ts` — Sync mutations through Yjs shared document
- `components/canvas/graph-canvas.tsx` — Render presence cursors
- `components/layout/header.tsx` — Show online collaborators

### Success Criteria
- [x] Pluggable collaboration provider (LocalCollaborationProvider + interface for Yjs)
- [x] Live cursor rendering component with name labels
- [x] Presence avatars component with online status dots
- [x] useCollaboration hook with cursor/node selection sync
- [ ] Production WebSocket backend (requires PartyKit/Liveblocks deployment)

---

## Phase 12: Integrations

### Goal
Connect VisionPath to the tools teams already use: GitHub, Slack, Linear.

### GitHub Integration
- Create GitHub issues from task nodes (one-click)
- Sync issue status back to VisionPath
- Link PRs to task nodes
- Auto-update task status when PR merges

### Slack Integration
- Post project updates to a Slack channel
- Receive notifications for comments, assignments, status changes
- `/visionpath` slash command to check project status

### Linear Integration
- Bidirectional sync: VisionPath tasks ↔ Linear issues
- Import Linear projects into VisionPath canvas
- Push VisionPath plan to Linear backlog

### New Files
- `app/api/integrations/github/route.ts` — GitHub OAuth + webhook handler
- `app/api/integrations/slack/route.ts` — Slack OAuth + event handler
- `app/api/integrations/linear/route.ts` — Linear API sync
- `components/integrations/integration-settings.tsx` — Settings panel for connected services
- `services/integrations/*.ts` — Service-specific API clients

### Success Criteria
- [x] GitHub: Service to create issues from nodes, fetch issue status
- [x] Slack: Webhook message builders for status changes, comments, assignments
- [x] Linear: GraphQL client for creating issues, fetching teams
- [x] Integration settings UI with connect/disconnect per service
- [ ] OAuth flows for production (requires server-side secrets)

---

## Implementation Priority Summary

### Build First (Highest ROI, Lowest Dependency)
1. **Command Palette** — Quick win, 1-2 hours, massive UX improvement
2. **AI Iteration Loops** — Uses existing Gemini infra, very high wow factor
3. **Multiple Views** — Transforms the product from canvas-only to full PM tool
4. **Assignees + Priority** — Foundation for team features

### Build Next (Medium Effort, Multiplier Features)
5. **Comments & Activity** — Team collaboration basics
6. **Timeline / Gantt** — PM's favorite view
7. **AI Smart Suggestions** — Ambient intelligence differentiator
8. **Sprint Planning** — Execution tracking

### Build Last (High Effort, Requires Infrastructure)
9. **Embedded Docs** — Rich content expansion
10. **Version History** — Complex but unique
11. **Real-Time Collab** — Requires CRDT infrastructure
12. **Integrations** — Requires OAuth flows and webhook handlers

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Command palette | Custom (no dependency) | Keep bundle small, simple fuzzy match |
| Table view | Custom with CSS Grid | No heavy table library needed for our use case |
| Board view | Native drag-and-drop API | Avoid dnd-kit dependency, keep it simple |
| Timeline view | Custom SVG | No good lightweight Gantt library for React 19 |
| Block editor | Extend existing Tiptap | Already have @tiptap/react installed |
| Real-time sync | Yjs + PartyKit | Best CRDT library + serverless WebSocket |
| Integrations | Next.js API routes + OAuth | No separate backend needed |

---

## Getting Started

To begin implementation, start with **Phase 1: Command Palette** — it's the quickest win and immediately makes the app feel professional. Then move to **Phase 4: AI Iteration** for the biggest wow factor, followed by **Phase 2: Multiple Views** to transform the product.

Run: `npm run dev` and start building Phase 1.
