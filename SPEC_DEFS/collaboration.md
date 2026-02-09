---
id: spec-collaboration
type: feature
status: pending
parent: root
---

# Real-Time Collaboration

Multi-user editing with CRDT-based conflict resolution and presence awareness.

---

## Overview

Multiple users can work on the same canvas simultaneously. Changes sync in real-time via WebSocket, with Yjs CRDT handling conflict resolution automatically. Users see each other's cursors and active selections.

---

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Client A   │     │  PartyKit   │     │  Client B   │
│  (Browser)  │◄───►│  (Server)   │◄───►│  (Browser)  │
├─────────────┤     ├─────────────┤     ├─────────────┤
│  Zustand    │     │  Y.Doc      │     │  Zustand    │
│     ↕       │     │  (shared)   │     │     ↕       │
│   Y.Doc     │◄───►│             │◄───►│   Y.Doc     │
│  (local)    │     └─────────────┘     │  (local)    │
└─────────────┘                         └─────────────┘
```

---

## Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| CRDT | Yjs | Conflict-free data synchronization |
| Transport | y-partykit | WebSocket provider |
| Server | PartyKit | Managed WebSocket infrastructure |
| Persistence | IndexedDB | Offline support |
| Awareness | Yjs Awareness | Presence/cursor sync |

---

## Yjs Data Structure

```typescript
// lib/collaboration.ts

import * as Y from 'yjs';
import { WebsocketProvider } from 'y-partykit/provider';
import { IndexeddbPersistence } from 'y-indexeddb';

// Create Y.Doc (shared document)
const ydoc = new Y.Doc();

// Shared data structures
const yNodes = ydoc.getMap<YNode>('nodes');
const yEdges = ydoc.getMap<YEdge>('edges');
const yMeta = ydoc.getMap<any>('metadata');

// Types matching Yjs structure
interface YNode {
  id: string;
  type: string;
  title: string;
  description?: string;
  status: string;
  position: { x: number; y: number };
  plan?: YPlanItem[];
  updatedAt: number;
  updatedBy: string;
}

interface YEdge {
  id: string;
  source: string;
  target: string;
}

interface YPlanItem {
  id: string;
  text: string;
  completed: boolean;
}
```

---

## PartyKit Server

```typescript
// party/index.ts

import type * as Party from 'partykit/server';
import { onConnect } from 'y-partykit';

export default class VisionPathServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // Handle Yjs WebSocket protocol
    return onConnect(conn, this.room, {
      persist: true,  // Persist to Durable Objects
    });
  }
}
```

### PartyKit Configuration

```json
// partykit.json
{
  "name": "visionpath",
  "main": "party/index.ts"
}
```

### Deployment

```bash
npx partykit deploy
# Deploys to: visionpath.partykit.dev
```

---

## Client Connection

```typescript
// lib/collaboration.ts

export function initCollaboration(roomId: string, userId: string) {
  const ydoc = new Y.Doc();
  
  // Connect to PartyKit
  const wsProvider = new WebsocketProvider(
    'wss://visionpath.partykit.dev',
    `room-${roomId}`,
    ydoc,
    { connect: true }
  );

  // Local persistence (offline support)
  const indexeddbProvider = new IndexeddbPersistence(
    `visionpath-${roomId}`,
    ydoc
  );

  // Awareness (presence)
  const awareness = wsProvider.awareness;
  awareness.setLocalState({
    user: {
      id: userId,
      name: getUserName(),
      color: getUserColor(),
    },
    cursor: null,
    selectedNodeId: null,
  });

  return { ydoc, wsProvider, awareness };
}
```

---

## Zustand-Yjs Sync

### Yjs → Zustand

```typescript
// lib/yjs-sync.ts

export function observeYjsChanges(
  yNodes: Y.Map<YNode>,
  yEdges: Y.Map<YEdge>,
  store: CanvasStore
) {
  yNodes.observe((event) => {
    event.changes.keys.forEach((change, key) => {
      if (change.action === 'add' || change.action === 'update') {
        const yNode = yNodes.get(key);
        if (yNode) {
          store.upsertNode(yNodeToVisionNode(yNode));
        }
      } else if (change.action === 'delete') {
        store.removeNode(key);
      }
    });
  });

  yEdges.observe((event) => {
    event.changes.keys.forEach((change, key) => {
      if (change.action === 'add' || change.action === 'update') {
        const yEdge = yEdges.get(key);
        if (yEdge) {
          store.upsertEdge(yEdgeToVisionEdge(yEdge));
        }
      } else if (change.action === 'delete') {
        store.removeEdge(key);
      }
    });
  });
}
```

### Zustand → Yjs

```typescript
// In canvasStore actions

addNode: (type, position) => {
  const node = createNode(type, position);
  
  // Update local state
  set({ nodes: [...get().nodes, node] });
  
  // Sync to Yjs
  ydoc.transact(() => {
    yNodes.set(node.id, visionNodeToYNode(node));
  });
  
  return node;
},

updateNode: (id, updates) => {
  set({
    nodes: get().nodes.map(n => 
      n.id === id ? { ...n, ...updates } : n
    ),
  });
  
  // Sync to Yjs
  const yNode = yNodes.get(id);
  if (yNode) {
    ydoc.transact(() => {
      yNodes.set(id, { ...yNode, ...updates, updatedAt: Date.now() });
    });
  }
},
```

---

## Presence & Awareness

### Cursor Tracking

```typescript
// hooks/usePresence.ts

export function usePresence(awareness: Awareness) {
  const [users, setUsers] = useState<AwarenessUser[]>([]);

  useEffect(() => {
    const handleChange = () => {
      const states = Array.from(awareness.getStates().values());
      setUsers(states.filter(s => s.user).map(s => s.user));
    };

    awareness.on('change', handleChange);
    return () => awareness.off('change', handleChange);
  }, [awareness]);

  const updateCursor = useCallback((position: { x: number; y: number } | null) => {
    awareness.setLocalStateField('cursor', position);
  }, [awareness]);

  const updateSelection = useCallback((nodeId: string | null) => {
    awareness.setLocalStateField('selectedNodeId', nodeId);
  }, [awareness]);

  return { users, updateCursor, updateSelection };
}
```

### Cursor Rendering

```tsx
// components/canvas/Cursors.tsx

export function Cursors() {
  const { users } = usePresence();
  const localUserId = useAuthStore(s => s.userId);

  return (
    <>
      {users
        .filter(u => u.id !== localUserId && u.cursor)
        .map(user => (
          <div
            key={user.id}
            className="pointer-events-none absolute z-50"
            style={{
              transform: `translate(${user.cursor.x}px, ${user.cursor.y}px)`,
            }}
          >
            {/* Cursor arrow */}
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                d="M5 3l14 9-8 2-2 8z"
                fill={user.color}
                stroke="white"
                strokeWidth="1"
              />
            </svg>
            {/* Name label */}
            <span
              className="ml-4 rounded px-1 text-xs text-white"
              style={{ backgroundColor: user.color }}
            >
              {user.name}
            </span>
          </div>
        ))}
    </>
  );
}
```

### Selection Highlighting

```tsx
// In node components

function GoalNode({ data, selected }: NodeProps) {
  const { users } = usePresence();
  const othersSelecting = users.filter(
    u => u.selectedNodeId === data.id && u.id !== localUserId
  );

  return (
    <BaseNode 
      data={data}
      selected={selected}
      className={cn(
        othersSelecting.length > 0 && 'ring-2',
      )}
      style={{
        '--ring-color': othersSelecting[0]?.color,
      }}
    >
      {othersSelecting.length > 0 && (
        <div className="absolute -top-6 left-0 flex gap-1">
          {othersSelecting.map(u => (
            <span
              key={u.id}
              className="rounded px-1 text-xs text-white"
              style={{ backgroundColor: u.color }}
            >
              {u.name}
            </span>
          ))}
        </div>
      )}
      {/* ... rest of node */}
    </BaseNode>
  );
}
```

---

## Conflict Resolution

Yjs CRDTs handle conflicts automatically:

| Operation | Resolution |
|-----------|------------|
| Concurrent text edit | Both edits preserved (merge) |
| Same field update | Last-write-wins by timestamp |
| Add same item | Deduplication by ID |
| Delete while editing | Delete wins (tombstone) |

### Plan Checkbox Merge

```typescript
// Yjs automatically merges Y.Array items
// Each checkbox is an item in Y.Array
// Completing a checkbox = updating that item's `completed` field
// Both users can check different items simultaneously
```

---

## Offline Support

```typescript
// IndexedDB persistence handles offline
indexeddbProvider.on('synced', () => {
  console.log('Local data loaded from IndexedDB');
});

// When back online, Yjs syncs automatically
wsProvider.on('status', ({ status }) => {
  if (status === 'connected') {
    console.log('Reconnected, syncing...');
  }
});
```

---

## User Authentication

```typescript
// Basic user identification (can integrate with auth provider)

interface CollabUser {
  id: string;
  name: string;
  color: string;
}

function generateUserColor(): string {
  const colors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getUserFromStorage(): CollabUser {
  const stored = localStorage.getItem('visionpath-user');
  if (stored) return JSON.parse(stored);
  
  const user = {
    id: crypto.randomUUID(),
    name: `User ${Math.floor(Math.random() * 1000)}`,
    color: generateUserColor(),
  };
  localStorage.setItem('visionpath-user', JSON.stringify(user));
  return user;
}
```

---

## Room Management

```typescript
// Each project = one room
// Room ID from URL or project ID

function getRoomId(): string {
  // From URL: /project/abc123 → "abc123"
  const match = window.location.pathname.match(/\/project\/([^/]+)/);
  return match?.[1] || 'default';
}
```

---

## Acceptance Criteria

- [ ] Changes sync between two browsers in < 500ms
- [ ] Cursors visible for all connected users
- [ ] User names shown on cursor and selection
- [ ] Offline edits preserved in IndexedDB
- [ ] Reconnection syncs offline changes
- [ ] No data loss on concurrent edits
- [ ] Plan checkboxes merge correctly
- [ ] PartyKit server deployed and accessible

---

## Dependencies

- yjs (install: `pnpm add yjs`)
- y-partykit (install: `pnpm add y-partykit`)
- y-indexeddb (install: `pnpm add y-indexeddb`)
- partykit (install: `pnpm add -D partykit`)
