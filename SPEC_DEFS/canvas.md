---
id: spec-canvas
type: feature
status: pending
parent: root
---

# Canvas Core

The infinite canvas component using React Flow for node/edge rendering and navigation.

---

## Overview

The canvas is the primary workspace where users visualize and manipulate their project graph. It must feel responsive, support thousands of nodes (with virtualization), and provide intuitive navigation.

---

## Requirements

### Functional

| ID | Requirement | Priority |
|----|-------------|----------|
| F1 | Infinite pan in all directions | Must |
| F2 | Zoom from 10% to 400% | Must |
| F3 | Minimap showing full graph | Should |
| F4 | Grid background (subtle dots) | Should |
| F5 | Dark theme by default | Must |
| F6 | Selection box (drag to multi-select) | Should |
| F7 | Fit-to-view button | Should |

### Non-Functional

| ID | Requirement | Target |
|----|-------------|--------|
| NF1 | 60fps during pan/zoom | Must |
| NF2 | < 100ms initial render (500 nodes) | Should |
| NF3 | Virtualize off-screen nodes | Must |

---

## Technical Design

### Component Structure

```
components/canvas/
├── Canvas.tsx          # Main wrapper, ReactFlowProvider
├── CanvasControls.tsx  # Zoom buttons, fit button
├── CanvasBackground.tsx # Grid dots
└── CanvasMinimap.tsx   # Navigation minimap
```

### React Flow Configuration

```tsx
// Canvas.tsx

import { ReactFlow, Background, MiniMap, Controls } from '@xyflow/react';
import { nodeTypes } from '../nodes';
import { edgeTypes } from '../edges';

export function Canvas() {
  const { nodes, edges, onNodesChange, onEdgesChange } = useCanvasStore();
  
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
      minZoom={0.1}
      maxZoom={4}
      defaultViewport={{ x: 0, y: 0, zoom: 1 }}
    >
      <Background variant="dots" gap={20} size={1} />
      <MiniMap nodeColor={getNodeColor} />
      <Controls />
    </ReactFlow>
  );
}
```

### Theme Colors

```css
/* globals.css */

:root {
  --canvas-bg: hsl(220 20% 10%);
  --canvas-dots: hsl(220 10% 20%);
  --node-goal: hsl(210 100% 50%);
  --node-subgoal: hsl(180 70% 45%);
  --node-feature: hsl(270 60% 55%);
  --node-task: hsl(220 15% 40%);
}
```

---

## User Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Pan | Middle-click drag OR Space + drag | Move viewport |
| Zoom | Scroll wheel OR pinch | Scale viewport |
| Select | Click node | Select single node |
| Multi-select | Shift + click | Add to selection |
| Box select | Drag on canvas (not node) | Select all in box |
| Context menu | Right-click | Show add/delete options |

---

## State Integration

```typescript
// Zustand store slice

interface CanvasSlice {
  viewport: { x: number; y: number; zoom: number };
  setViewport: (viewport: Viewport) => void;
  
  selectedNodeIds: string[];
  selectNode: (id: string, additive?: boolean) => void;
  selectNodes: (ids: string[]) => void;
  clearSelection: () => void;
}
```

---

## Acceptance Criteria

- [ ] Can pan infinitely in any direction
- [ ] Zoom works with scroll and pinch
- [ ] Minimap reflects current graph
- [ ] Grid dots visible on dark background
- [ ] Selection highlights nodes
- [ ] Fit-to-view centers all nodes
- [ ] 60fps maintained during interaction

---

## Dependencies

- @xyflow/react v12.3.2
- Zustand store must be initialized first

---

## Open Questions

1. Should we save viewport position to localStorage?
2. Do we need a "lock viewport" mode for presentations?
