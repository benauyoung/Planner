---
id: spec-physics
type: feature
status: pending
parent: spec-canvas
---

# Spring Physics Engine

d3-force integration for organic node positioning with spring-based clustering.

---

## Overview

Nodes use physics simulation to naturally cluster related items and prevent overlap. The system creates an organic, living feel while maintaining user control through manual repositioning.

---

## Physics Forces

### 1. Charge Force (Repulsion)

All nodes repel each other to prevent overlap.

```typescript
forceManyBody()
  .strength(-300)  // Negative = repel
  .distanceMin(50) // Don't calculate at very close range
  .distanceMax(500) // Stop affecting beyond this
```

### 2. Link Force (Spring Attraction)

Connected nodes (via edges) attract each other.

```typescript
forceLink(edges)
  .id(d => d.id)
  .distance(150)    // Target distance between connected nodes
  .strength(0.5)    // How strongly to pull toward target
```

### 3. Center Force

Gentle pull toward canvas center (prevents drift).

```typescript
forceCenter(0, 0)
  .strength(0.02)  // Very weak, just prevents infinite drift
```

### 4. Collision Force

Hard boundary to prevent node overlap.

```typescript
forceCollide()
  .radius(d => getNodeRadius(d.type) + 20)  // Node size + padding
  .strength(0.8)
```

---

## Configuration

```typescript
// lib/physics.ts

export interface PhysicsConfig {
  enabled: boolean;
  repulsion: number;      // Default: -300
  linkDistance: number;   // Default: 150
  linkStrength: number;   // Default: 0.5
  centerStrength: number; // Default: 0.02
  damping: number;        // Default: 0.9 (velocity decay)
  alphaDecay: number;     // Default: 0.02 (how fast simulation cools)
}

export const DEFAULT_PHYSICS: PhysicsConfig = {
  enabled: true,
  repulsion: -300,
  linkDistance: 150,
  linkStrength: 0.5,
  centerStrength: 0.02,
  damping: 0.9,
  alphaDecay: 0.02,
};
```

---

## Integration with React Flow

### Simulation Setup

```typescript
// lib/physics.ts

import { 
  forceSimulation, 
  forceLink, 
  forceManyBody, 
  forceCenter,
  forceCollide 
} from 'd3-force';

export function createPhysicsSimulation(
  nodes: VisionNode[],
  edges: VisionEdge[],
  config: PhysicsConfig,
  onTick: (nodes: VisionNode[]) => void
) {
  const simulation = forceSimulation(nodes)
    .force('charge', forceManyBody().strength(config.repulsion))
    .force('link', forceLink(edges)
      .id((d: any) => d.id)
      .distance(config.linkDistance)
      .strength(config.linkStrength)
    )
    .force('center', forceCenter(0, 0).strength(config.centerStrength))
    .force('collide', forceCollide().radius(80))
    .velocityDecay(config.damping)
    .alphaDecay(config.alphaDecay)
    .on('tick', () => {
      // Update node positions
      onTick(nodes.map(n => ({
        ...n,
        position: { x: n.x, y: n.y }
      })));
    });

  return simulation;
}
```

### Zustand Integration

```typescript
// stores/canvasStore.ts

interface CanvasStore {
  // ... other state
  simulation: Simulation | null;
  physicsConfig: PhysicsConfig;
  
  initPhysics: () => void;
  pausePhysics: () => void;
  resumePhysics: () => void;
  setPhysicsConfig: (config: Partial<PhysicsConfig>) => void;
}
```

---

## User Interaction Handling

### Drag Override

When user drags a node, physics pauses for that node:

```typescript
function onNodeDragStart(event: NodeDragEvent, node: VisionNode) {
  // Fix node position (exclude from simulation)
  node.fx = node.position.x;
  node.fy = node.position.y;
  
  // Reheat simulation for other nodes
  simulation.alpha(0.3).restart();
}

function onNodeDrag(event: NodeDragEvent, node: VisionNode) {
  // Update fixed position
  node.fx = event.position.x;
  node.fy = event.position.y;
}

function onNodeDragEnd(event: NodeDragEvent, node: VisionNode) {
  // Release node back to simulation (optional)
  // Or keep it fixed where user placed it
  if (config.releaseOnDragEnd) {
    node.fx = null;
    node.fy = null;
  }
}
```

### Manual Position Lock

Users can lock a node's position:

```typescript
interface VisionNode {
  // ... other fields
  positionLocked: boolean;  // If true, excluded from physics
}
```

---

## Performance Optimization

### Throttling

Limit tick updates to prevent excessive re-renders:

```typescript
let lastTick = 0;
const TICK_INTERVAL = 16; // ~60fps

simulation.on('tick', () => {
  const now = Date.now();
  if (now - lastTick < TICK_INTERVAL) return;
  lastTick = now;
  
  onTick(nodes);
});
```

### Alpha Threshold

Stop simulation when settled:

```typescript
simulation.alphaMin(0.001);  // Stop when alpha falls below this
```

### Node Limit Warning

```typescript
const MAX_PHYSICS_NODES = 500;

if (nodes.length > MAX_PHYSICS_NODES) {
  console.warn('Physics may be slow with', nodes.length, 'nodes');
  // Consider disabling physics or reducing tick rate
}
```

---

## Visual Feedback

### Simulation State Indicator

Show when physics is active:

```tsx
function PhysicsIndicator() {
  const { simulation } = useCanvasStore();
  const isActive = simulation?.alpha() > simulation?.alphaMin();
  
  return (
    <div className="absolute top-2 right-2">
      {isActive && (
        <span className="text-xs text-blue-400 animate-pulse">
          ◉ Physics active
        </span>
      )}
    </div>
  );
}
```

---

## Acceptance Criteria

- [ ] Nodes repel each other (no overlap)
- [ ] Connected nodes cluster together
- [ ] Dragging a node temporarily fixes it
- [ ] Releasing node resumes physics (or locks it)
- [ ] Simulation settles to stable state
- [ ] 60fps maintained with 200 nodes
- [ ] Can toggle physics on/off

---

## Dependencies

- d3-force (install: `pnpm add d3-force @types/d3-force`)
- Canvas must be mounted before simulation starts
- Zustand store for configuration persistence
