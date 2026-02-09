---
id: spec-nodes
type: feature
status: pending
parent: spec-canvas
---

# Node System

Custom React Flow nodes representing Goals, Subgoals, Features, and Tasks.

---

## Overview

Nodes are the core visual elements on the canvas. Each type has distinct styling to communicate hierarchy at a glance. All nodes share common behaviors (selection, dragging, status indicators) but vary in size and color.

---

## Node Types

| Type | Purpose | Size | Color Token |
|------|---------|------|-------------|
| Goal | Top-level objective | 240x100 | `--node-goal` (blue) |
| Subgoal | Major milestone | 200x80 | `--node-subgoal` (cyan) |
| Feature | Specific capability | 180x70 | `--node-feature` (purple) |
| Task | Atomic work item | 160x60 | `--node-task` (gray) |

---

## Visual Design

### Common Elements

```
┌─────────────────────────────────────┐
│ ● Title                        [▼] │  ← Status dot, expand button
├─────────────────────────────────────┤
│ Optional description preview...     │  ← Truncated to 2 lines
└─────────────────────────────────────┘
```

### Status Indicators

| Status | Dot Color | Border |
|--------|-----------|--------|
| Pending | Gray | None |
| In Progress | Blue | Blue glow |
| Completed | Green | Green check |
| Blocked | Red | Red dashed |

---

## Component Structure

### BaseNode

```tsx
// components/nodes/BaseNode.tsx

interface BaseNodeProps {
  data: VisionNode;
  selected: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function BaseNode({ data, selected, className, children }: BaseNodeProps) {
  const statusColor = getStatusColor(data.status);
  
  return (
    <div className={cn(
      'rounded-lg border bg-card p-3 shadow-md transition-all',
      selected && 'ring-2 ring-primary',
      data.status === 'blocked' && 'border-dashed border-red-500',
      className
    )}>
      <div className="flex items-center gap-2">
        <span 
          className="h-2 w-2 rounded-full" 
          style={{ backgroundColor: statusColor }}
        />
        <span className="font-medium truncate">{data.title}</span>
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
      </div>
      {children}
    </div>
  );
}
```

### GoalNode

```tsx
// components/nodes/GoalNode.tsx

export function GoalNode({ data, selected }: NodeProps<VisionNode>) {
  return (
    <BaseNode 
      data={data} 
      selected={selected}
      className="w-60 bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500"
    >
      {data.description && (
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
          {data.description}
        </p>
      )}
      <div className="mt-2 text-xs text-blue-400">
        {countChildren(data.id)} subgoals
      </div>
    </BaseNode>
  );
}
```

### Node Registration

```tsx
// components/nodes/index.ts

import { GoalNode } from './GoalNode';
import { SubgoalNode } from './SubgoalNode';
import { FeatureNode } from './FeatureNode';
import { TaskNode } from './TaskNode';

export const nodeTypes = {
  goal: GoalNode,
  subgoal: SubgoalNode,
  feature: FeatureNode,
  task: TaskNode,
};
```

---

## Interactions

| Action | Behavior |
|--------|----------|
| Click | Select node, deselect others |
| Shift+Click | Add to selection |
| Double-click | Open drill-down panel |
| Drag | Move node (pauses physics) |
| Right-click | Open context menu |

### Context Menu Items

- Add Child → Subgoal/Feature/Task (based on current type)
- Edit Title
- Change Status →
- Delete Node
- Duplicate Node

---

## Handles (Connection Points)

```tsx
// Left handle = input (dependencies come in)
<Handle 
  type="target" 
  position={Position.Left}
  className="!w-3 !h-3 !bg-blue-500"
/>

// Right handle = output (dependents go out)
<Handle 
  type="source" 
  position={Position.Right}
  className="!w-3 !h-3 !bg-blue-500"
/>
```

---

## Responsive Sizing

| Zoom Level | Behavior |
|------------|----------|
| > 100% | Full detail, description visible |
| 50-100% | Title only, no description |
| < 50% | Compact: dot + truncated title |

---

## Acceptance Criteria

- [ ] All 4 node types render with distinct colors
- [ ] Status dot reflects current status
- [ ] Selected nodes have visible ring
- [ ] Blocked nodes have dashed red border
- [ ] Handles visible for edge connections
- [ ] Double-click opens panel
- [ ] Context menu works

---

## Dependencies

- BaseNode depends on Zustand store for selection state
- Nodes must be registered in nodeTypes before Canvas mounts
