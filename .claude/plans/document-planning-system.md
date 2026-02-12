# Implementation Plan: Document Planning System (v2 — Updated)

## Goal

Transform VisionPath from "project planner with attached docs" to "visual documentation architecture tool" by making documents first-class nodes on the canvas with typed relationship edges.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Doc node parents | Any node type | Maximum flexibility, no enforcement |
| Hierarchy rules | No enforcement | Edge types convey semantics; users connect freely |
| Detail panel layout | Single scroll | Consistent with existing pattern |
| AI awareness | Include now | Doc types need content generation from the start |
| Content editing | Use existing BlockEditor | Every node already has `node.document.blocks`; no parallel content system |

---

## Phase 1: Types & Data Model

### Step 1.1: Update `types/project.ts`

**NodeType** — add 5 doc types:
```typescript
export type NodeType =
  | 'goal' | 'subgoal' | 'feature' | 'task'
  | 'moodboard' | 'notes' | 'connector'
  | 'spec' | 'prd' | 'schema' | 'prompt' | 'reference'
```

**EdgeType** — add 5 doc relationship types:
```typescript
export type EdgeType =
  | 'hierarchy' | 'blocks' | 'depends_on'
  | 'informs' | 'defines' | 'implements' | 'references' | 'supersedes'
```

**PlanNode** — add optional doc-specific fields (alongside existing `assigneeId`, `priority`, `dueDate`, `tags`, `document`, `comments`, etc.):
```typescript
// Doc-specific fields
version?: string
schemaType?: 'data_model' | 'api_contract' | 'database' | 'other'
promptType?: 'implementation' | 'refactor' | 'test' | 'review'
targetTool?: 'cursor' | 'windsurf' | 'claude' | 'generic'
referenceType?: 'link' | 'file' | 'image'
url?: string
acceptanceCriteria?: string[]
```

### Step 1.2: Update `types/canvas.ts`

Add to `PlanNodeData` interface:
```typescript
version?: string
schemaType?: string
promptType?: string
targetTool?: string
referenceType?: string
url?: string
acceptanceCriteria?: string[]
```

### Step 1.3: Update `types/chat.ts`

Extend `AIPlanNode.type`:
```typescript
type: 'goal' | 'subgoal' | 'feature' | 'task' | 'spec' | 'prd' | 'schema' | 'prompt' | 'reference'
```

---

## Phase 2: Constants & CSS

### Step 2.1: Update `lib/constants.ts`

Add to `NODE_CONFIG` (5 new entries following the existing pattern with `label`, `color`, `bgClass`, `borderClass`, `textClass`, `badgeClass`, `icon`, `width`, `height`):

| Type | Label | Icon | bgClass (light/dark) | Width | Height |
|------|-------|------|---------------------|-------|--------|
| spec | Specification | ScrollText | bg-sky-50 / bg-sky-950/30 | 300 | 140 |
| prd | PRD | ClipboardList | bg-purple-50 / bg-purple-950/30 | 280 | 130 |
| schema | Schema | Braces | bg-teal-50 / bg-teal-950/30 | 260 | 120 |
| prompt | Prompt | Terminal | bg-emerald-50 / bg-emerald-950/30 | 240 | 110 |
| reference | Reference | ExternalLink | bg-gray-50 / bg-gray-950/30 | 200 | 80 |

Add to `NODE_CHILD_TYPE` (all `null` — doc nodes don't auto-create typed children):
```typescript
spec: null,
prd: null,
schema: null,
prompt: null,
reference: null,
```

### Step 2.2: Update `app/globals.css`

Add CSS variables in `:root` and `.dark`:

```css
/* :root (light) */
--node-spec: 200 80% 50%;
--node-prd: 270 60% 55%;
--node-schema: 175 60% 42%;
--node-prompt: 152 60% 42%;
--node-reference: 220 10% 50%;

/* .dark */
--node-spec: 200 80% 60%;
--node-prd: 270 60% 65%;
--node-schema: 175 60% 52%;
--node-prompt: 152 60% 52%;
--node-reference: 220 15% 55%;
```

---

## Phase 3: Edge Styling & Store

### Step 3.1: Update `stores/project-store.ts` — `EDGE_STYLES`

Add 5 new entries:
```typescript
informs:    { stroke: 'hsl(200 80% 50%)', animated: false },
defines:    { stroke: 'hsl(270 60% 55%)', animated: false },
implements: { stroke: 'hsl(152 60% 42%)', animated: false },
references: { strokeDasharray: '6 4', stroke: 'hsl(220 10% 50%)', animated: false },
supersedes: { strokeDasharray: '3 3', stroke: 'hsl(0 70% 55%)', animated: false },
```

### Step 3.2: Update `planNodesToFlow` — label mapping

In the `depEdges` builder (line ~136), extend the label fallback to include new edge types:
```typescript
label: e.label || {
  blocks: 'blocks',
  depends_on: 'depends on',
  informs: 'informs',
  defines: 'defines',
  implements: 'implements',
  references: 'references',
  supersedes: 'supersedes',
}[edgeType]
```

### Step 3.3: Update `planNodesToFlow` — pass doc fields to flow node data

In the `.map()` that builds flow nodes (line ~88-108), add:
```typescript
version: node.version,
schemaType: node.schemaType,
promptType: node.promptType,
targetTool: node.targetTool,
referenceType: node.referenceType,
url: node.url,
acceptanceCriteria: node.acceptanceCriteria,
```

### Step 3.4: Update `addDependencyEdge` — label mapping

Extend the label assignment (line ~608) to include labels for new edge types.

### Step 3.5: Update `addFreeNode` — doc type defaults

Extend the defaults in `addFreeNode` (line ~562-577):
```typescript
content: type === 'notes' ? '' : undefined,
images: type === 'moodboard' ? [] : undefined,
// Doc type defaults:
schemaType: type === 'schema' ? 'other' : undefined,
promptType: type === 'prompt' ? 'implementation' : undefined,
targetTool: type === 'prompt' ? 'generic' : undefined,
referenceType: type === 'reference' ? 'link' : undefined,
acceptanceCriteria: type === 'prd' ? [] : undefined,
```

### Step 3.6: Add new store actions

Simple field updaters following the `updateNodeStatus` pattern:
```typescript
updateNodeVersion: (nodeId: string, version: string) => void
updateNodeSchemaType: (nodeId: string, schemaType: PlanNode['schemaType']) => void
updateNodePromptType: (nodeId: string, promptType: PlanNode['promptType']) => void
updateNodeTargetTool: (nodeId: string, targetTool: PlanNode['targetTool']) => void
updateNodeReferenceType: (nodeId: string, referenceType: PlanNode['referenceType']) => void
updateNodeUrl: (nodeId: string, url: string) => void
updateNodeAcceptanceCriteria: (nodeId: string, criteria: string[]) => void
```

---

## Phase 4: Node Components

All 5 follow the custom-layout pattern from `notes-node.tsx` / `moodboard-node.tsx` (not the `BasePlanNode` wrapper pattern).

Each includes: badge with type icon/label, status dot, NodeToolbar, target/source Handles, content preview.

### Step 4.1: Create `components/canvas/nodes/spec-node.tsx`
- Icon: ScrollText, badge: "Specification"
- Shows version badge if set (e.g. "v1.2")
- Previews first block of `node.document.blocks` (line-clamp-4)
- Empty state: "Click to add specification"

### Step 4.2: Create `components/canvas/nodes/prd-node.tsx`
- Icon: ClipboardList, badge: "PRD"
- Shows acceptance criteria count if any (e.g. "3 criteria")
- Shows version badge if set
- Previews first block content (line-clamp-4)
- Empty state: "Click to add requirements"

### Step 4.3: Create `components/canvas/nodes/schema-node.tsx`
- Icon: Braces, badge: "Schema"
- Shows schemaType badge (e.g. "API Contract", "Data Model")
- Content preview in monospace font
- Empty state: "Click to define schema"

### Step 4.4: Create `components/canvas/nodes/prompt-node.tsx`
- Icon: Terminal, badge: "Prompt"
- Shows targetTool badge (e.g. "Claude", "Cursor")
- Shows promptType badge (e.g. "Implementation")
- Content in monospace, line-clamp-3
- Empty state: "Click to write prompt"

### Step 4.5: Create `components/canvas/nodes/reference-node.tsx`
- Icon: ExternalLink, badge: "Reference"
- Compact node (smallest)
- Shows truncated URL if link type
- Shows referenceType badge
- Empty state: "Add reference"

### Step 4.6: Update `components/canvas/nodes/node-types.ts`

Import and register all 5:
```typescript
import { SpecNode } from './spec-node'
import { PrdNode } from './prd-node'
import { SchemaNode } from './schema-node'
import { PromptNode } from './prompt-node'
import { ReferenceNode } from './reference-node'

export const nodeTypes = {
  // ...existing 7...
  spec: SpecNode,
  prd: PrdNode,
  schema: SchemaNode,
  prompt: PromptNode,
  reference: ReferenceNode,
}
```

---

## Phase 5: Context Menus

### Step 5.1: Update `components/canvas/context-menu/pane-context-menu.tsx`

Add 5 new entries to `NODE_OPTIONS` with icons (ScrollText, ClipboardList, Braces, Terminal, ExternalLink). Add a section divider with "Document Nodes" header before the doc entries.

Add soft auto-connect suggestions to `PARENT_TYPE_MAP`:
```typescript
spec: ['goal', 'subgoal'],
prd: ['spec', 'feature'],
schema: ['spec', 'prd'],
prompt: ['prd', 'schema', 'feature', 'task'],
// reference: no entry (no auto-connect suggestion)
```

### Step 5.2: Update `components/canvas/context-menu/node-context-menu.tsx`

**NODE_TYPES array** (line 40) — add 5 new types so they appear in "Change Type" submenu.

**Add doc node quick-create buttons** — after existing "Add Connector" button, add a divider and:
- Add Specification
- Add PRD
- Add Schema
- Add Prompt
- Add Reference

Each calls `addFreeNode(type, 'New [Label]', node.parentId)`.

**Add new edge creation buttons** — after existing "Depends On" button:
- "Informs..." (sky-blue icon)
- "Defines..." (purple icon)
- "Implements..." (green icon)
- "References..." (gray icon)
- "Supersedes..." (red icon)

Each calls `startEdgeCreation(nodeId, edgeType)`.

---

## Phase 6: Detail Panel

### Step 6.1: Update `components/panels/node-detail-panel.tsx`

**TYPE_OPTIONS** (line 29) — add 5 new types.

**Doc-specific fields** — add conditionally between the Tags section and the Document (BlockEditor) section. Inline in the existing scroll:

**For spec nodes:**
```
- Version input field
(Document/BlockEditor already handles content editing)
```

**For prd nodes:**
```
- Version input field
- Acceptance criteria list editor:
  - Editable list with add/remove buttons
  - Each criterion is an inline text input
(Document/BlockEditor already handles rich content)
```

**For schema nodes:**
```
- Version input field
- Schema type dropdown: data_model | api_contract | database | other
(Document/BlockEditor already handles code content via code blocks)
```

**For prompt (node type) nodes:**
```
- Prompt type dropdown: implementation | refactor | test | review
- Target tool dropdown: cursor | windsurf | claude | generic
- Prominent "Copy to Clipboard" button (copies all block content)
(Document/BlockEditor handles the prompt text)
```

**For reference nodes:**
```
- Reference type dropdown: link | file | image
- URL input (for link type)
- File upload zone (for file type — reuse moodboard drag-drop pattern)
```

**Document lineage breadcrumb** — for all doc node types, show before the BlockEditor:
- Traces `informs` / `defines` / `implements` edges to build a chain
- Display: "Vision Doc → Architecture → API Spec → This PRD"
- Each breadcrumb item is clickable (navigates via `selectNode`)

---

## Phase 7: Blast Radius

### Step 7.1: Update `lib/blast-radius.ts`

In `getBlastRadius`, extend the traversal to include new edge types. Add to the `blockedEdges` filter (line ~24-29):

```typescript
const downstreamEdges = project.edges.filter(
  (e) => e.source === currentId && (
    e.edgeType === 'blocks' ||
    e.edgeType === 'depends_on' ||
    e.edgeType === 'informs' ||
    e.edgeType === 'defines' ||
    e.edgeType === 'implements' ||
    e.edgeType === 'references'
  )
)
```

Also add `supersedes` as a reverse traversal (if something supersedes currentId, it's affected).

---

## Phase 8: Export

### Step 8.1: Update `lib/export-markdown.ts`

**`exportSubtreeAsMarkdown`** — add doc-node-aware sections:

- For `spec` nodes: output as "## Specification" with version, render document blocks as markdown
- For `prd` nodes: output acceptance criteria as a checklist
- For `schema` nodes: render document blocks (code blocks will naturally format)
- For `prompt` nodes: output with target tool note, render blocks
- For `reference` nodes: output URL as link

**`exportFullPlanAsMarkdown`** — add a "## Documentation" section that groups doc nodes by type (Specs, PRDs, Schemas, Prompts, References).

### Step 8.2: Update `lib/node-context.ts`

In `buildNodeContext`, after the target node section:
- Include doc-specific metadata (version, schemaType, promptType, targetTool)
- Include document block content as text
- Include connected doc edges (what this node informs/defines/implements)
- Include acceptance criteria for PRD nodes

---

## Phase 9: AI Awareness

### Step 9.1: Update `prompts/planning-system.ts`

Extend `PLANNING_SYSTEM_PROMPT`:

Add to PLAN HIERARCHY section:
```
- spec: High-level specification documents (architecture, vision, requirements). parentId references a goal or subgoal.
- prd: Product Requirements Documents with acceptance criteria. parentId references a spec or feature.
- schema: Data models, API contracts, database schemas. parentId references a spec or prd.
- prompt: Implementation prompts for AI/IDE tools. parentId references a prd, schema, feature, or task.
- reference: External links and resources. Can connect to anything.
```

Add to RESPONSE FORMAT:
```
Doc node types can include: "spec", "prd", "schema", "prompt", "reference"
When the user asks for documentation, architecture docs, or specs, use these doc node types instead of generic notes.
```

### Step 9.2: Update `app/api/ai/generate-prd/route.ts`

Update system prompt to understand it may be generating for a `prd` node type (not just embedded PRD). Include connected spec content if available via doc edges.

### Step 9.3: Update `app/api/ai/generate-prompt/route.ts`

Update to include connected PRD and schema content from doc edges when generating.

### Step 9.4: Update `app/api/ai/generate-questions/route.ts`

Add doc-type-aware question generation:
- For `spec`: ask about scope, stakeholders, constraints, architecture style
- For `prd`: ask about acceptance criteria, user stories, edge cases
- For `schema`: ask about entities, relationships, validation rules, versioning
- For `prompt`: ask about target tool, coding style, framework preferences

### Step 9.5: Update AI iteration actions

In `node-context-menu.tsx`, add doc-aware AI actions alongside existing ones (break_down, rewrite, estimate, suggest_deps):
- **AI: Generate Spec** — for spec nodes, generates architecture content into BlockEditor
- **AI: Generate Acceptance Criteria** — for prd nodes, generates criteria list

Wire these through the existing `CustomEvent('ai-iterate')` pattern.

---

## Phase 10: Views Integration

### Step 10.1: Update view filters

In the UI store, `filterType` already accepts `NodeType | null`. Once the NodeType union is extended, the filter dropdowns in list/table/board views will need the new types added to their options.

Check and update filter UI in any view components that hardcode node type lists.

### Step 10.2: Update command palette

If the command palette has "create node" commands, add entries for the 5 new doc types.

---

## Files Summary

### Create (5 files)
| File | Description |
|------|-------------|
| `components/canvas/nodes/spec-node.tsx` | Specification node component |
| `components/canvas/nodes/prd-node.tsx` | PRD node component |
| `components/canvas/nodes/schema-node.tsx` | Schema node component |
| `components/canvas/nodes/prompt-node.tsx` | Prompt node component |
| `components/canvas/nodes/reference-node.tsx` | Reference node component |

### Modify (16 files)
| File | Changes |
|------|---------|
| `types/project.ts` | Extend NodeType, EdgeType, add PlanNode fields |
| `types/canvas.ts` | Add doc fields to PlanNodeData |
| `types/chat.ts` | Extend AIPlanNode.type union |
| `lib/constants.ts` | Add 5 NODE_CONFIG + NODE_CHILD_TYPE entries |
| `app/globals.css` | Add 5 CSS color variables (light + dark) |
| `stores/project-store.ts` | EDGE_STYLES, planNodesToFlow, addFreeNode, addDependencyEdge, new actions |
| `components/canvas/nodes/node-types.ts` | Register 5 new components |
| `components/canvas/context-menu/pane-context-menu.tsx` | Add doc node options + PARENT_TYPE_MAP |
| `components/canvas/context-menu/node-context-menu.tsx` | Add edge types, doc node buttons, NODE_TYPES |
| `components/panels/node-detail-panel.tsx` | Add doc-specific fields, TYPE_OPTIONS, lineage breadcrumb |
| `lib/blast-radius.ts` | Traverse new edge types |
| `lib/export-markdown.ts` | Handle doc nodes in both export functions |
| `lib/node-context.ts` | Include doc fields + edges in AI context |
| `prompts/planning-system.ts` | Add doc types to system prompt |
| `app/api/ai/generate-prd/route.ts` | Doc-edge-aware generation |
| `app/api/ai/generate-questions/route.ts` | Doc-type-aware question generation |

---

## Implementation Order

1. **Phase 1** — Types (zero visual change, enables everything)
2. **Phase 2** — Constants + CSS (still no visible change, but config ready)
3. **Phase 3** — Store + edges (edges render correctly, new actions available)
4. **Phase 4** — Node components (nodes appear on canvas)
5. **Phase 5** — Context menus (users can create nodes and edges)
6. **Phase 6** — Detail panel (users can edit doc-specific fields)
7. **Phase 7** — Blast radius (doc changes propagate visually)
8. **Phase 8** — Export (markdown handles doc nodes)
9. **Phase 9** — AI awareness (AI can generate and understand doc types)
10. **Phase 10** — Views integration (filters, command palette)

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Existing projects break | All new fields optional; type unions only expand |
| BlockEditor overlap with old `content` field | Doc nodes use BlockEditor exclusively; `content` field left for notes/moodboard backward compat |
| Context menu gets too long | Section headers + dividers between plan nodes and doc nodes |
| AI hallucinating doc types | Update ALL AI prompts in Phase 9 together |
| Filter/view components hardcode node types | Audit all view files in Phase 10 |
