# Contributing to VisionPath

> Coding standards and conventions for the VisionPath codebase. Updated February 2026.

---

## Golden Rules

1. **Zero-Inference Policy**: Never assume. If it's not in the types or code, it doesn't exist.
2. **Type Safety**: All code must pass `npx tsc --noEmit` before committing.
3. **Follow Existing Patterns**: Use existing components and store methods as reference.

---

## Code Style

### TypeScript

- No semicolons (project convention)
- Single quotes
- 2-space indent
- Explicit types for function parameters and interfaces
- Avoid `any` — use proper types from `types/project.ts` and `types/canvas.ts`

```typescript
// ✅ Project style
interface PlanNode {
  id: string
  type: NodeType
  title: string
}

function createNode(type: NodeType, title: string): string {
  const id = generateId()
  // ...
  return id
}
```

### React Components

- Functional components with named exports
- `'use client'` directive for client components
- Props destructured in function signature
- Zustand selectors for shared state, `useState` for local UI state

```tsx
'use client'

import { useProjectStore } from '@/stores/project-store'

export function GoalNode({ data, id }: NodeProps<PlanNodeData>) {
  const selectNode = useUIStore((s) => s.selectNode)
  return (
    <div onClick={() => selectNode(id)}>
      <h3>{data.label}</h3>
    </div>
  )
}
```

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | kebab-case | `goal-node.tsx`, `node-detail-panel.tsx` |
| Stores | kebab-case | `project-store.ts` |
| Types | kebab-case | `project.ts`, `canvas.ts` |
| Hooks | kebab-case with `use-` prefix | `use-auto-layout.ts` |
| Constants | kebab-case | `constants.ts` |

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `GoalNode`, `NodeDetailPanel` |
| Functions | camelCase | `addFreeNode`, `planNodesToFlow` |
| Constants | SCREAMING_SNAKE | `NODE_CONFIG`, `DAGRE_CONFIG` |
| Types/Interfaces | PascalCase | `PlanNode`, `NodePRD` |
| CSS classes | Tailwind utilities | `bg-background`, `text-muted-foreground` |

---

## Store Patterns

### Adding a New Store Method

1. Add the method signature to the `ProjectState` interface
2. Implement it in the `create()` call
3. Always call `planNodesToFlow()` after mutating nodes
4. Always update `updatedAt` on the project

```typescript
// Pattern for node mutation methods
someMethod: (nodeId, value) => {
  const project = get().currentProject
  if (!project) return
  const updatedNodes = project.nodes.map((n) =>
    n.id === nodeId ? { ...n, someField: value } : n
  )
  const updatedProject = { ...project, nodes: updatedNodes, updatedAt: Date.now() }
  const { flowNodes, flowEdges } = planNodesToFlow(updatedNodes)
  set({ currentProject: updatedProject, flowNodes, flowEdges })
},
```

### Adding a New Node Type

1. Add to `NodeType` union in `types/project.ts`
2. Add config to `NODE_CONFIG` in `lib/constants.ts`
3. Add child type mapping to `NODE_CHILD_TYPE`
4. Create component in `components/canvas/nodes/`
5. Register in `node-types.ts`
6. Add CSS variables in `app/globals.css`
7. Add Tailwind color in `tailwind.config.ts`

---

## Git Workflow

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat(canvas): add smart mapping to pane context menu
feat(store): add PRD and prompt CRUD methods
fix(onboarding): make Start Planning button always visible
docs: update all documentation to match current state
```

---

## Verification Before Committing

```bash
npx tsc --noEmit    # Must pass with no errors
npm run build       # Must compile successfully
```

---

## Security

- API keys in `.env.local` only, never committed
- Firebase fully null-guarded — app works without keys
- No `dangerouslySetInnerHTML` — all content rendered via React components
