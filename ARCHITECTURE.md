# VisionPath Architecture

> The source of truth for "how we build." AI agents must follow the patterns defined here.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Browser (Client)                                │
├─────────────────┬─────────────────┬─────────────────┬───────────────────────┤
│   React Flow    │     Zustand     │      Yjs        │     Gemini API        │
│   (Canvas)      │     (State)     │    (CRDT)       │     (AI Chat)         │
├─────────────────┴────────┬────────┴─────────────────┴───────────────────────┤
│                          │                                                   │
│  ┌───────────────────────▼───────────────────────┐                          │
│  │              Physics Engine                    │                          │
│  │           (d3-force simulation)               │                          │
│  └───────────────────────────────────────────────┘                          │
└──────────────────────────┬──────────────────────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │       PartyKit          │
              │   (WebSocket Server)    │
              │   Real-time Sync        │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │       Chokidar          │
              │    (File Watcher)       │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │    /territory/*.md      │
              │    (File System)        │
              └─────────────────────────┘
```

---

## Core Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | Next.js | 15.1.3 | App Router, API routes, SSR |
| Language | TypeScript | 5.x | Type safety, interfaces |
| Canvas | @xyflow/react | 12.3.2 | Infinite canvas, node/edge rendering |
| Physics | d3-force | 3.x | Spring simulation for node positioning |
| State | Zustand | 5.x | Local reactive state |
| CRDT | Yjs | 13.x | Conflict-free replicated data types |
| Real-time | PartyKit | latest | Managed WebSocket infrastructure |
| AI | @google/generative-ai | 0.21.0 | Gemini 2.0 Flash integration |
| File Watch | Chokidar | 3.x | Cross-platform file system watcher |
| Layout | Dagre | 0.8.5 | Directed graph auto-layout |
| Styling | Tailwind CSS | 3.4.x | Utility-first CSS |
| Icons | Lucide React | 0.462.0 | Icon library |
| Animation | Framer Motion | 11.x | Smooth transitions |

---

## Data Models

### Node Types

```typescript
// types/node.ts

type NodeType = 'goal' | 'subgoal' | 'feature' | 'task';

type NodeStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

interface VisionNode {
  id: string;
  type: NodeType;
  
  // Content
  title: string;
  description?: string;
  plan?: PlanItem[];
  
  // Position (managed by physics engine)
  position: { x: number; y: number };
  
  // Metadata
  status: NodeStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  
  // File sync
  filePath?: string;  // e.g., "SPEC_DEFS/authentication.md"
  
  // Chat history (per-node AI context)
  chatHistory?: ChatMessage[];
}

interface PlanItem {
  id: string;
  text: string;
  completed: boolean;
  indent: number;  // For nested items
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
```

### Edge Types

```typescript
// types/edge.ts

type EdgeStatus = 'pending' | 'active' | 'completed' | 'blocked';

interface VisionEdge {
  id: string;
  source: string;      // Parent node ID
  target: string;      // Child node ID
  
  // Visual
  animated: boolean;
  status: EdgeStatus;
  
  // Validation
  isValid: boolean;    // False if creates cycle
}
```

### Canvas State

```typescript
// types/canvas.ts

interface CanvasState {
  nodes: VisionNode[];
  edges: VisionEdge[];
  
  // Viewport
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  
  // Selection
  selectedNodeIds: string[];
  
  // UI State
  activePanelNodeId?: string;  // Which node's panel is open
  isPhysicsEnabled: boolean;
}
```

---

## State Management Architecture

### Zustand Store Structure

```typescript
// stores/canvasStore.ts

interface CanvasStore {
  // State
  nodes: VisionNode[];
  edges: VisionEdge[];
  selectedNodeIds: string[];
  
  // Actions
  addNode: (type: NodeType, position: Position) => void;
  updateNode: (id: string, updates: Partial<VisionNode>) => void;
  deleteNode: (id: string) => void;
  
  addEdge: (source: string, target: string) => boolean;  // Returns false if cycle
  deleteEdge: (id: string) => void;
  
  setSelection: (nodeIds: string[]) => void;
  
  // Physics
  setNodePosition: (id: string, position: Position) => void;
}
```

### Yjs Integration (Collaboration)

```typescript
// lib/collaboration.ts

import * as Y from 'yjs';
import { WebsocketProvider } from 'y-partykit/provider';

const ydoc = new Y.Doc();
const yNodes = ydoc.getMap<VisionNode>('nodes');
const yEdges = ydoc.getMap<VisionEdge>('edges');

// Sync Zustand ↔ Yjs
yNodes.observe((event) => {
  // Update Zustand store when Yjs changes
});

// Connect to PartyKit
const provider = new WebsocketProvider(
  'wss://visionpath.partykit.dev',
  'project-room',
  ydoc
);
```

---

## Physics Engine

### d3-force Integration

```typescript
// lib/physics.ts

import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';

interface PhysicsConfig {
  repulsion: number;      // -300 default, negative = repel
  linkDistance: number;   // 150 default
  linkStrength: number;   // 0.5 default
  damping: number;        // 0.9 default (velocity decay)
}

function createSimulation(nodes: VisionNode[], edges: VisionEdge[]) {
  return forceSimulation(nodes)
    .force('charge', forceManyBody().strength(-300))
    .force('link', forceLink(edges).distance(150))
    .force('center', forceCenter(0, 0))
    .velocityDecay(0.9)
    .on('tick', () => {
      // Update node positions in Zustand
    });
}
```

### Physics Rules

1. **Node Repulsion**: All nodes repel each other to prevent overlap
2. **Edge Attraction**: Connected nodes attract (spring force)
3. **Damping**: Velocity decays to reach stable positions
4. **Drag Override**: User drag pauses physics for that node
5. **Resume**: Physics resumes on mouse release

---

## File System Sync (Territory)

### Directory Structure

```
territory/
├── README.md                 # Project overview (root Goal node)
├── VISION.md                 # Vision document
├── ARCHITECTURE.md           # This file
├── PLAN.md                   # Master checklist
├── CONTRIBUTING.md           # Dev guidelines
├── ROADMAP.md               # Milestone tracking
├── SPEC_DEFS/
│   ├── canvas-core.md       # Feature: Canvas
│   ├── node-system.md       # Feature: Nodes
│   ├── file-sync.md         # Feature: Territory sync
│   └── ai-integration.md    # Feature: Gemini
└── LOGS/
    └── 2025-01-15-session.md
```

### File Format

Each node serializes to Markdown with YAML frontmatter:

```markdown
---
id: "abc123"
type: "feature"
status: "in_progress"
created: "2025-01-15T10:30:00Z"
updated: "2025-01-15T14:45:00Z"
parent: "def456"
---

# Canvas Core

The infinite canvas component using React Flow.

## Plan

- [x] Set up React Flow provider
- [x] Configure dark theme
- [ ] Add minimap
- [ ] Implement zoom controls

## Notes

This uses @xyflow/react v12 which has breaking changes from v11.
```

### Sync Engine

```typescript
// lib/territory.ts

async function writeNodeToFile(node: VisionNode): Promise<void> {
  const frontmatter = yaml.stringify({
    id: node.id,
    type: node.type,
    status: node.status,
    created: node.createdAt.toISOString(),
    updated: new Date().toISOString(),
  });
  
  const content = `---\n${frontmatter}---\n\n# ${node.title}\n\n${node.description || ''}\n\n## Plan\n\n${formatPlan(node.plan)}`;
  
  await fs.writeFile(node.filePath, content, 'utf-8');
}

async function readFileToNode(filePath: string): Promise<VisionNode> {
  const content = await fs.readFile(filePath, 'utf-8');
  const { data, content: body } = matter(content);  // gray-matter
  
  return {
    id: data.id,
    type: data.type,
    status: data.status,
    title: extractTitle(body),
    description: extractDescription(body),
    plan: extractPlan(body),
    filePath,
    // ... other fields
  };
}
```

### Conflict Resolution

When external file edit detected:

1. **Compare timestamps** - File vs. node `updatedAt`
2. **If file newer** - Update node from file
3. **If node newer** - Prompt user: "External change detected. Keep canvas version or file version?"
4. **Merge if possible** - Plan checkboxes can merge (union of completed items)

---

## AI Integration

### Context Building

```typescript
// lib/ai-context.ts

function buildNodeContext(node: VisionNode, allNodes: VisionNode[], allEdges: VisionEdge[]): string {
  // Get upstream nodes (parents, grandparents, etc.)
  const upstream = getUpstreamNodes(node.id, allNodes, allEdges);
  
  // Build context string
  let context = `# Project Context\n\n`;
  
  for (const upNode of upstream) {
    context += `## ${upNode.type}: ${upNode.title}\n`;
    context += `Status: ${upNode.status}\n`;
    if (upNode.description) context += `${upNode.description}\n`;
    context += `\n`;
  }
  
  context += `# Current Node\n\n`;
  context += `Type: ${node.type}\n`;
  context += `Title: ${node.title}\n`;
  context += `Status: ${node.status}\n`;
  
  return context;
}
```

### System Instructions

```typescript
// lib/ai-prompts.ts

const SYSTEM_PROMPTS: Record<NodeType, string> = {
  goal: `You are helping plan a high-level project goal. Focus on breaking it into subgoals and identifying key milestones.`,
  
  subgoal: `You are helping plan a project subgoal. Focus on identifying the features needed to achieve this milestone.`,
  
  feature: `You are helping implement a specific feature. Focus on breaking it into concrete tasks and identifying technical requirements.`,
  
  task: `You are helping with a specific implementation task. Be precise, provide code snippets when helpful, and focus on actionable steps.`,
};
```

### API Route

```typescript
// app/api/ai/route.ts

import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  const { nodeId, message, context, nodeType } = await request.json();
  
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  const chat = model.startChat({
    history: [],
    systemInstruction: SYSTEM_PROMPTS[nodeType] + '\n\n' + context,
  });
  
  const result = await chat.sendMessageStream(message);
  
  // Return streaming response
  return new Response(result.stream, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
```

---

## Dependency Validation

### Cycle Detection

```typescript
// lib/validation.ts

function wouldCreateCycle(
  source: string,
  target: string,
  edges: VisionEdge[]
): boolean {
  // DFS from target to see if we can reach source
  const visited = new Set<string>();
  const stack = [target];
  
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current === source) return true;  // Cycle detected
    
    if (visited.has(current)) continue;
    visited.add(current);
    
    // Find all nodes that current points to
    const outgoing = edges
      .filter(e => e.source === current)
      .map(e => e.target);
    
    stack.push(...outgoing);
  }
  
  return false;
}
```

### Blocked Status Propagation

```typescript
function updateBlockedStatus(nodes: VisionNode[], edges: VisionEdge[]): VisionNode[] {
  return nodes.map(node => {
    // Get all parent nodes
    const parentIds = edges
      .filter(e => e.target === node.id)
      .map(e => e.source);
    
    const parents = nodes.filter(n => parentIds.includes(n.id));
    
    // If any parent is not completed, this node is blocked
    const isBlocked = parents.some(p => p.status !== 'completed');
    
    return {
      ...node,
      status: isBlocked && node.status !== 'completed' ? 'blocked' : node.status,
    };
  });
}
```

---

## Component Architecture

```
components/
├── canvas/
│   ├── Canvas.tsx           # Main React Flow wrapper
│   ├── CanvasControls.tsx   # Zoom, fit, lock buttons
│   └── Minimap.tsx          # Navigation minimap
├── nodes/
│   ├── BaseNode.tsx         # Shared node wrapper
│   ├── GoalNode.tsx         # Goal-specific styling
│   ├── SubgoalNode.tsx      
│   ├── FeatureNode.tsx      
│   └── TaskNode.tsx         
├── edges/
│   ├── DependencyEdge.tsx   # Animated cable
│   └── EdgeLabel.tsx        # Optional edge labels
├── panels/
│   ├── PlanPanel.tsx        # Plan view/edit
│   ├── ChatPanel.tsx        # AI chat interface
│   └── DetailsPanel.tsx     # Metadata view
└── ui/
    ├── Button.tsx           
    ├── Input.tsx            
    └── ContextMenu.tsx      
```

---

## Security Considerations

1. **API Keys**: Gemini API key stored in `.env.local`, never committed
2. **File Access**: Chokidar limited to `/territory` directory only
3. **WebSocket Auth**: PartyKit rooms require authentication token
4. **Input Sanitization**: All user input sanitized before rendering

---

## Performance Guidelines

1. **Node Limit**: Warn at 500 nodes, hard limit at 1000
2. **Physics Tick**: 60fps target, throttle if > 16ms per tick
3. **File Sync**: Debounce writes (500ms) to prevent thrashing
4. **AI Context**: Max 8000 tokens per request
5. **Virtualization**: React Flow handles off-screen node virtualization

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-01-15 | React Flow over D3.js | Better React integration, built-in interactions |
| 2025-01-15 | Zustand over Redux | Simpler API, perfect for this scale |
| 2025-01-15 | PartyKit over self-hosted | Managed infrastructure, faster iteration |
| 2025-01-15 | d3-force for physics | Battle-tested, integrates with React Flow |
| 2025-01-15 | Yjs for CRDT | Most mature JS CRDT library |
