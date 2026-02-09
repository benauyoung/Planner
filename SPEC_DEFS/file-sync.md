---
id: spec-file-sync
type: feature
status: pending
parent: root
---

# Territory File Sync

Bidirectional synchronization between canvas nodes and Markdown files.

---

## Overview

Every node on the canvas maps to a Markdown file in the `/territory` directory. Changes flow both ways:
- Edit on canvas → File updates
- Edit file externally → Canvas updates

This makes the visual canvas literally "the map is the territory."

---

## Directory Structure

```
territory/
├── README.md                 # Root Goal node
├── VISION.md                 # Vision document (informational)
├── ARCHITECTURE.md           # Architecture doc (informational)
├── PLAN.md                   # Master checklist
├── CONTRIBUTING.md           # Dev guidelines
├── ROADMAP.md               # Milestone tracking
├── SPEC_DEFS/               # Feature specifications
│   ├── canvas.md            # spec-canvas node
│   ├── nodes.md             # spec-nodes node
│   ├── physics.md           # spec-physics node
│   ├── file-sync.md         # This file
│   └── ai-integration.md    # spec-ai node
└── LOGS/                    # Session logs
    ├── 2025-01-15-session.md
    └── 2025-01-16-session.md
```

---

## File Format

### YAML Frontmatter

Every node file has metadata in YAML frontmatter:

```yaml
---
id: "abc123-def456"           # Unique node ID
type: "feature"               # goal | subgoal | feature | task
status: "in_progress"         # pending | in_progress | completed | blocked
parent: "parent-node-id"      # ID of parent node (for hierarchy)
created: "2025-01-15T10:30:00Z"
updated: "2025-01-15T14:45:00Z"
position:                     # Optional: locked position
  x: 100
  y: 200
positionLocked: true          # If true, physics won't move it
---
```

### Body Structure

```markdown
# Node Title

Optional description paragraph.

## Plan

- [x] Completed task
- [ ] Pending task
- [ ] Another pending task
  - [ ] Nested subtask

## Notes

Free-form notes section (not synced to plan items).

## Chat History

<!-- This section is auto-generated, do not edit manually -->
```

---

## Serialization

### Node to Markdown

```typescript
// lib/territory.ts

import yaml from 'yaml';

export function nodeToMarkdown(node: VisionNode): string {
  const frontmatter = yaml.stringify({
    id: node.id,
    type: node.type,
    status: node.status,
    parent: node.parentId,
    created: node.createdAt.toISOString(),
    updated: new Date().toISOString(),
    position: node.positionLocked ? node.position : undefined,
    positionLocked: node.positionLocked || undefined,
  });

  const plan = node.plan?.length 
    ? `## Plan\n\n${formatPlanItems(node.plan)}`
    : '';

  return `---
${frontmatter.trim()}
---

# ${node.title}

${node.description || ''}

${plan}
`.trim();
}

function formatPlanItems(items: PlanItem[], indent = 0): string {
  return items.map(item => {
    const prefix = '  '.repeat(indent);
    const checkbox = item.completed ? '[x]' : '[ ]';
    const children = item.children?.length 
      ? '\n' + formatPlanItems(item.children, indent + 1)
      : '';
    return `${prefix}- ${checkbox} ${item.text}${children}`;
  }).join('\n');
}
```

### Markdown to Node

```typescript
// lib/territory.ts

import matter from 'gray-matter';

export function markdownToNode(content: string, filePath: string): VisionNode {
  const { data, content: body } = matter(content);
  
  const title = extractTitle(body);
  const description = extractDescription(body);
  const plan = extractPlanItems(body);

  return {
    id: data.id,
    type: data.type,
    status: data.status,
    title,
    description,
    plan,
    parentId: data.parent,
    createdAt: new Date(data.created),
    updatedAt: new Date(data.updated),
    position: data.position || { x: 0, y: 0 },
    positionLocked: data.positionLocked || false,
    filePath,
  };
}

function extractTitle(body: string): string {
  const match = body.match(/^# (.+)$/m);
  return match?.[1] || 'Untitled';
}

function extractDescription(body: string): string {
  // Get text between title and first ## heading
  const match = body.match(/^# .+\n\n([\s\S]*?)(?=\n## |$)/);
  return match?.[1]?.trim() || '';
}

function extractPlanItems(body: string): PlanItem[] {
  const planSection = body.match(/## Plan\n\n([\s\S]*?)(?=\n## |$)/);
  if (!planSection) return [];
  
  return parsePlanMarkdown(planSection[1]);
}
```

---

## File Watcher

### Setup

```typescript
// lib/file-watcher.ts

import chokidar from 'chokidar';
import { debounce } from './utils';

const TERRITORY_PATH = './territory';
const DEBOUNCE_MS = 500;

export function startFileWatcher(
  onFileChange: (filePath: string, content: string) => void
) {
  const watcher = chokidar.watch(TERRITORY_PATH, {
    ignored: /(^|[\/\\])\../, // Ignore dotfiles
    persistent: true,
    ignoreInitial: true,
  });

  const handleChange = debounce(async (filePath: string) => {
    // Skip if we just wrote this file
    if (isOurWrite(filePath)) return;
    
    const content = await fs.readFile(filePath, 'utf-8');
    onFileChange(filePath, content);
  }, DEBOUNCE_MS);

  watcher
    .on('change', handleChange)
    .on('add', handleChange);

  return watcher;
}
```

### Preventing Loops

```typescript
// Track files we've recently written
const recentWrites = new Map<string, number>();
const WRITE_COOLDOWN = 1000;

function markAsOurWrite(filePath: string) {
  recentWrites.set(filePath, Date.now());
}

function isOurWrite(filePath: string): boolean {
  const writeTime = recentWrites.get(filePath);
  if (!writeTime) return false;
  
  const elapsed = Date.now() - writeTime;
  if (elapsed > WRITE_COOLDOWN) {
    recentWrites.delete(filePath);
    return false;
  }
  return true;
}
```

---

## Write Sync

### On Node Update

```typescript
// Called from Zustand store when node changes

const debouncedWrite = debounce(async (node: VisionNode) => {
  const markdown = nodeToMarkdown(node);
  const filePath = getFilePath(node);
  
  markAsOurWrite(filePath);
  await fs.writeFile(filePath, markdown, 'utf-8');
}, 500);

function getFilePath(node: VisionNode): string {
  if (node.filePath) return node.filePath;
  
  // Generate path based on type
  switch (node.type) {
    case 'goal':
      return `territory/README.md`;
    case 'feature':
      return `territory/SPEC_DEFS/${slugify(node.title)}.md`;
    default:
      return `territory/SPEC_DEFS/${slugify(node.title)}.md`;
  }
}
```

---

## Conflict Resolution

### Detection

```typescript
interface FileConflict {
  filePath: string;
  nodeVersion: VisionNode;
  fileVersion: VisionNode;
  fileModified: Date;
  nodeModified: Date;
}

function detectConflict(
  filePath: string, 
  fileContent: string,
  currentNode: VisionNode
): FileConflict | null {
  const fileNode = markdownToNode(fileContent, filePath);
  
  // If file is newer than our last sync, potential conflict
  if (fileNode.updatedAt > currentNode.updatedAt) {
    // Check if content actually differs
    if (hasSignificantDiff(currentNode, fileNode)) {
      return {
        filePath,
        nodeVersion: currentNode,
        fileVersion: fileNode,
        fileModified: fileNode.updatedAt,
        nodeModified: currentNode.updatedAt,
      };
    }
  }
  
  return null;
}
```

### Resolution UI

```tsx
// components/ConflictModal.tsx

function ConflictModal({ conflict, onResolve }: ConflictModalProps) {
  return (
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>External Change Detected</DialogTitle>
        </DialogHeader>
        
        <p>The file was modified outside VisionPath:</p>
        <code>{conflict.filePath}</code>
        
        <div className="flex gap-4 mt-4">
          <Button onClick={() => onResolve('canvas')}>
            Keep Canvas Version
          </Button>
          <Button onClick={() => onResolve('file')}>
            Keep File Version
          </Button>
          <Button onClick={() => onResolve('merge')}>
            Merge (Keep Both Checkboxes)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Merge Strategy

For plan checkboxes, merge by union:

```typescript
function mergePlans(canvasPlan: PlanItem[], filePlan: PlanItem[]): PlanItem[] {
  const merged = new Map<string, PlanItem>();
  
  // Add all canvas items
  for (const item of canvasPlan) {
    merged.set(item.text, item);
  }
  
  // Merge file items (union of completed states)
  for (const item of filePlan) {
    const existing = merged.get(item.text);
    if (existing) {
      existing.completed = existing.completed || item.completed;
    } else {
      merged.set(item.text, item);
    }
  }
  
  return Array.from(merged.values());
}
```

---

## Acceptance Criteria

- [ ] Node changes write to file within 500ms
- [ ] External file edits update canvas
- [ ] No infinite loops (write → detect → write)
- [ ] Conflict detected when timestamps diverge
- [ ] Conflict modal offers 3 resolution options
- [ ] Merge combines checkbox states correctly
- [ ] New nodes create new files
- [ ] Handles special characters in titles (slugify)

---

## Dependencies

- chokidar (install: `pnpm add chokidar`)
- gray-matter (install: `pnpm add gray-matter`)
- Node.js fs/promises for file operations
