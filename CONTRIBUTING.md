# Contributing to VisionPath

> The rulebook. AI agents must read this before writing any code.

---

## Golden Rules

1. **Zero-Inference Policy**: Never assume. If it's not in the docs or code, it doesn't exist.
2. **Atomic Updates**: Update PLAN.md immediately when completing a subtask. Documentation and code move in lockstep.
3. **Context Window Diet**: Keep files under 500 lines. Break large specs into linked files.

---

## Code Style

### TypeScript

```typescript
// ✅ Good: Explicit types, clear naming
interface VisionNode {
  id: string;
  type: NodeType;
  title: string;
}

function createNode(type: NodeType, title: string): VisionNode {
  return {
    id: crypto.randomUUID(),
    type,
    title,
  };
}

// ❌ Bad: Implicit any, unclear naming
function create(t, n) {
  return { id: crypto.randomUUID(), type: t, title: n };
}
```

### React Components

```tsx
// ✅ Good: Props interface, descriptive component name
interface GoalNodeProps {
  data: VisionNode;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function GoalNode({ data, selected, onSelect }: GoalNodeProps) {
  return (
    <div 
      className={cn('node-goal', selected && 'ring-2')}
      onClick={() => onSelect(data.id)}
    >
      <h3>{data.title}</h3>
    </div>
  );
}

// ❌ Bad: Inline types, generic naming
export function Node({ data, selected, onSelect }: any) {
  return <div onClick={() => onSelect(data.id)}>{data.title}</div>;
}
```

### File Organization

```
// ✅ Good: One component per file, clear naming
components/
├── nodes/
│   ├── GoalNode.tsx
│   ├── FeatureNode.tsx
│   └── index.ts        // Re-exports

// ❌ Bad: Multiple components, unclear names
components/
├── Nodes.tsx           // Contains all node types
├── stuff.tsx           // Unclear purpose
```

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `GoalNode`, `PlanPanel` |
| Functions | camelCase | `createNode`, `updatePlan` |
| Constants | SCREAMING_SNAKE | `MAX_NODES`, `DEFAULT_ZOOM` |
| Types/Interfaces | PascalCase | `VisionNode`, `EdgeStatus` |
| Files (components) | PascalCase | `GoalNode.tsx` |
| Files (utilities) | camelCase | `validation.ts` |
| CSS classes | kebab-case | `node-goal`, `panel-header` |

---

## Git Workflow

### Branch Naming

```
feature/canvas-physics
fix/node-deletion-bug
refactor/store-structure
docs/architecture-update
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code change that neither fixes nor adds
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**

```bash
# ✅ Good commits
feat(canvas): add spring physics simulation
fix(nodes): prevent circular dependency creation
docs(architecture): add physics engine section
refactor(stores): split canvasStore into smaller stores

# ❌ Bad commits
update stuff
fix bug
wip
asdfasdf
```

### Pull Request Template

```markdown
## Summary
Brief description of changes.

## Type
- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Documentation

## Checklist
- [ ] Tests pass locally
- [ ] PLAN.md updated
- [ ] No console.log statements
- [ ] Types are explicit (no `any`)

## Screenshots
(If UI changes)
```

---

## Testing Guidelines

### Unit Tests

```typescript
// lib/__tests__/validation.test.ts

import { wouldCreateCycle } from '../validation';

describe('wouldCreateCycle', () => {
  it('returns false for valid edge', () => {
    const edges = [{ id: '1', source: 'a', target: 'b' }];
    expect(wouldCreateCycle('b', 'c', edges)).toBe(false);
  });

  it('returns true for direct cycle', () => {
    const edges = [{ id: '1', source: 'a', target: 'b' }];
    expect(wouldCreateCycle('b', 'a', edges)).toBe(true);
  });

  it('returns true for indirect cycle', () => {
    const edges = [
      { id: '1', source: 'a', target: 'b' },
      { id: '2', source: 'b', target: 'c' },
    ];
    expect(wouldCreateCycle('c', 'a', edges)).toBe(true);
  });
});
```

### Component Tests

```typescript
// components/nodes/__tests__/GoalNode.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { GoalNode } from '../GoalNode';

describe('GoalNode', () => {
  const mockNode = {
    id: '1',
    type: 'goal' as const,
    title: 'Build VisionPath',
    status: 'in_progress' as const,
  };

  it('renders title', () => {
    render(<GoalNode data={mockNode} selected={false} onSelect={jest.fn()} />);
    expect(screen.getByText('Build VisionPath')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = jest.fn();
    render(<GoalNode data={mockNode} selected={false} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Build VisionPath'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});
```

---

## Linting & Formatting

### ESLint Config

```javascript
// .eslintrc.js
module.exports = {
  extends: ['next/core-web-vitals', 'prettier'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'react/prop-types': 'off',
  },
};
```

### Prettier Config

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Pre-commit Hooks

```json
// package.json
{
  "scripts": {
    "lint": "next lint",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.md": ["prettier --write"]
  }
}
```

---

## Documentation Standards

### Code Comments

```typescript
// ✅ Good: Explains WHY, not WHAT
// We use a Set here because checking for cycles requires O(1) lookups
const visited = new Set<string>();

// ❌ Bad: Explains obvious code
// Create a new Set
const visited = new Set<string>();
```

### JSDoc for Public APIs

```typescript
/**
 * Checks if adding an edge would create a cycle in the dependency graph.
 * Uses depth-first search from target to see if source is reachable.
 * 
 * @param source - The node the edge starts from
 * @param target - The node the edge points to
 * @param edges - Current edges in the graph
 * @returns True if adding this edge would create a cycle
 * 
 * @example
 * ```ts
 * const edges = [{ source: 'a', target: 'b' }];
 * wouldCreateCycle('b', 'a', edges); // true (would create a→b→a)
 * wouldCreateCycle('b', 'c', edges); // false (no cycle)
 * ```
 */
export function wouldCreateCycle(
  source: string,
  target: string,
  edges: VisionEdge[]
): boolean {
  // ...
}
```

---

## AI Agent Rules

When an AI agent works on this codebase:

1. **Read First**: Always read ARCHITECTURE.md before making changes
2. **Check PLAN.md**: Verify the current task status before starting
3. **Update Atomically**: Mark tasks complete in PLAN.md immediately
4. **Follow Patterns**: Use existing code as reference for style
5. **No Guessing**: If a type or function doesn't exist, don't invent it
6. **Context Diet**: Only request files you need, not the whole codebase

### Agent Handoff Template

```markdown
## Session End Summary

**Objective**: What I tried to do
**Outcome**: What I actually accomplished
**Blockers**: What prevented completion (if any)
**Next Steps**: Specific instructions for next agent

### Files Modified
- `path/to/file.ts` - Brief description of change

### PLAN.md Updates
- [x] Task completed
- [ ] Task remaining (blocked by X)
```

---

## Performance Checklist

Before submitting a PR:

- [ ] No unnecessary re-renders (use React DevTools)
- [ ] Large lists are virtualized
- [ ] Images are optimized
- [ ] No N+1 queries
- [ ] Bundle size checked (`pnpm build && pnpm analyze`)

---

## Security Checklist

- [ ] No API keys in code
- [ ] User input sanitized
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] File paths validated (no path traversal)
- [ ] WebSocket messages authenticated
