---
id: spec-ai
type: feature
status: pending
parent: root
---

# AI Integration

Gemini-powered AI assistant with context-aware chat and automated planning actions.

---

## Overview

Each node has an embedded AI chat that understands its position in the project hierarchy. The AI receives only upstream context (parent nodes) to keep responses relevant and token usage efficient.

---

## AI Actions

| Action | Description | Trigger |
|--------|-------------|---------|
| **Chat** | Free-form conversation about the node | User message |
| **Decompose** | Break node into child nodes | Button click |
| **Plan** | Generate implementation checklist | Button click |
| **Review** | Check plan for completeness | Button click |
| **Suggest** | Recommend next actions | Automatic |

---

## Context Building

### Upstream Traversal

```typescript
// lib/ai-context.ts

export function getUpstreamNodes(
  nodeId: string,
  nodes: VisionNode[],
  edges: VisionEdge[]
): VisionNode[] {
  const upstream: VisionNode[] = [];
  const visited = new Set<string>();
  const queue = [nodeId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    // Find parent edges (edges pointing TO this node)
    const parentEdges = edges.filter(e => e.target === current);
    
    for (const edge of parentEdges) {
      const parentNode = nodes.find(n => n.id === edge.source);
      if (parentNode) {
        upstream.push(parentNode);
        queue.push(parentNode.id);
      }
    }
  }

  // Return in hierarchical order (root first)
  return upstream.reverse();
}
```

### Context Formatting

```typescript
export function buildNodeContext(
  node: VisionNode,
  upstreamNodes: VisionNode[]
): string {
  let context = `# Project Context\n\n`;
  context += `You are helping with a ${node.type} in a software project.\n\n`;

  if (upstreamNodes.length > 0) {
    context += `## Hierarchy (from root to current)\n\n`;
    
    for (const upNode of upstreamNodes) {
      context += `### ${upNode.type.toUpperCase()}: ${upNode.title}\n`;
      context += `Status: ${upNode.status}\n`;
      if (upNode.description) {
        context += `${upNode.description}\n`;
      }
      if (upNode.plan?.length) {
        context += `\nPlan:\n`;
        for (const item of upNode.plan) {
          context += `- [${item.completed ? 'x' : ' '}] ${item.text}\n`;
        }
      }
      context += `\n`;
    }
  }

  context += `## Current Node\n\n`;
  context += `**Type**: ${node.type}\n`;
  context += `**Title**: ${node.title}\n`;
  context += `**Status**: ${node.status}\n`;
  if (node.description) {
    context += `\n${node.description}\n`;
  }
  if (node.plan?.length) {
    context += `\n### Current Plan\n\n`;
    for (const item of node.plan) {
      context += `- [${item.completed ? 'x' : ' '}] ${item.text}\n`;
    }
  }

  return context;
}
```

### Token Budget

```typescript
const MAX_CONTEXT_TOKENS = 8000;
const CHARS_PER_TOKEN = 4; // Rough estimate

export function trimContextToFit(context: string): string {
  const maxChars = MAX_CONTEXT_TOKENS * CHARS_PER_TOKEN;
  
  if (context.length <= maxChars) return context;
  
  // Truncate older upstream nodes first
  const sections = context.split('### ');
  while (context.length > maxChars && sections.length > 2) {
    sections.splice(1, 1); // Remove oldest upstream node
    context = sections.join('### ');
  }
  
  return context;
}
```

---

## System Prompts

```typescript
// lib/ai-prompts.ts

export const SYSTEM_PROMPTS: Record<NodeType, string> = {
  goal: `You are a strategic project planning assistant. 
Your job is to help break down high-level goals into achievable subgoals.

When the user asks for decomposition:
- Suggest 3-5 major subgoals
- Each subgoal should be a clear milestone
- Order them by dependency (what must come first)

When reviewing a plan:
- Check for missing dependencies
- Identify potential blockers
- Suggest timeline estimates`,

  subgoal: `You are a project milestone planning assistant.
Your job is to help identify the features needed to achieve this subgoal.

When decomposing:
- Suggest specific features that make up this milestone
- Each feature should be a deliverable capability
- Consider both user-facing and technical features

When planning:
- Break the subgoal into concrete deliverables
- Identify technical requirements`,

  feature: `You are a technical feature planning assistant.
Your job is to help break features into implementable tasks.

When decomposing:
- Suggest atomic tasks (each completable in 1-4 hours)
- Include both implementation and testing tasks
- Order by technical dependency

When planning:
- List specific code changes needed
- Identify files to create or modify
- Note any external dependencies`,

  task: `You are an implementation assistant.
Your job is to help complete specific coding tasks.

Be precise and actionable:
- Provide code snippets when helpful
- Reference specific files and functions
- Follow the project's coding standards (see CONTRIBUTING.md)
- Never invent functions or types that don't exist`,
};
```

---

## API Route

```typescript
// app/api/ai/route.ts

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { 
    nodeId, 
    nodeType,
    message, 
    context,
    action,
    chatHistory 
  } = await request.json();

  // Validate
  if (!message && !action) {
    return Response.json({ error: 'Message or action required' }, { status: 400 });
  }

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp',
    systemInstruction: SYSTEM_PROMPTS[nodeType] + '\n\n' + context,
  });

  // Build prompt based on action
  let prompt = message;
  if (action === 'decompose') {
    prompt = `Please break this ${nodeType} into smaller ${getChildType(nodeType)}s. 
Provide a numbered list with title and brief description for each.`;
  } else if (action === 'plan') {
    prompt = `Please create an implementation plan for this ${nodeType}. 
Provide a checklist of specific tasks in Markdown checkbox format.`;
  } else if (action === 'review') {
    prompt = `Please review the current plan for completeness. 
Identify any missing steps, potential blockers, or improvements.`;
  }

  // Start chat with history
  const chat = model.startChat({
    history: chatHistory?.map((msg: any) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    })) || [],
  });

  // Stream response
  const result = await chat.sendMessageStream(prompt);
  
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream) {
        const text = chunk.text();
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

function getChildType(type: NodeType): string {
  switch (type) {
    case 'goal': return 'subgoal';
    case 'subgoal': return 'feature';
    case 'feature': return 'task';
    default: return 'subtask';
  }
}
```

---

## Chat Panel Integration

```typescript
// stores/chatStore.ts

interface ChatStore {
  // Per-node chat history
  chatHistories: Record<string, ChatMessage[]>;
  
  // Current streaming message
  streamingMessage: string | null;
  isLoading: boolean;
  
  // Actions
  sendMessage: (nodeId: string, message: string) => Promise<void>;
  executeAction: (nodeId: string, action: AIAction) => Promise<void>;
  clearHistory: (nodeId: string) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chatHistories: {},
  streamingMessage: null,
  isLoading: false,

  sendMessage: async (nodeId, message) => {
    const node = useCanvasStore.getState().nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Add user message
    const history = get().chatHistories[nodeId] || [];
    history.push({ role: 'user', content: message, timestamp: new Date() });
    set({ chatHistories: { ...get().chatHistories, [nodeId]: history } });

    // Build context
    const { nodes, edges } = useCanvasStore.getState();
    const upstream = getUpstreamNodes(nodeId, nodes, edges);
    const context = buildNodeContext(node, upstream);

    // Call API
    set({ isLoading: true, streamingMessage: '' });
    
    const response = await fetch('/api/ai', {
      method: 'POST',
      body: JSON.stringify({
        nodeId,
        nodeType: node.type,
        message,
        context,
        chatHistory: history,
      }),
    });

    // Handle streaming response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ') && !line.includes('[DONE]')) {
          const data = JSON.parse(line.slice(6));
          fullResponse += data.text;
          set({ streamingMessage: fullResponse });
        }
      }
    }

    // Add assistant message to history
    history.push({ role: 'assistant', content: fullResponse, timestamp: new Date() });
    set({ 
      chatHistories: { ...get().chatHistories, [nodeId]: history },
      streamingMessage: null,
      isLoading: false,
    });
  },
}));
```

---

## Decompose Action Flow

When user clicks "Decompose":

1. AI generates list of child nodes
2. Parse response to extract titles/descriptions
3. Create new nodes in Zustand store
4. Create edges from current node to children
5. Trigger physics to position new nodes
6. Sync new nodes to territory files

```typescript
async function handleDecompose(nodeId: string) {
  const response = await executeAction(nodeId, 'decompose');
  const children = parseDecomposeResponse(response);
  
  const { addNode, addEdge } = useCanvasStore.getState();
  const parentNode = nodes.find(n => n.id === nodeId);
  const childType = getChildType(parentNode.type);
  
  for (const child of children) {
    const newNode = addNode(childType, {
      x: parentNode.position.x + 200,
      y: parentNode.position.y + (children.indexOf(child) * 100),
    });
    newNode.title = child.title;
    newNode.description = child.description;
    
    addEdge(nodeId, newNode.id);
  }
}

function parseDecomposeResponse(response: string): { title: string; description: string }[] {
  // Parse numbered list from AI response
  const regex = /^\d+\.\s+\*\*(.+?)\*\*:?\s*(.*)$/gm;
  const results = [];
  let match;
  
  while ((match = regex.exec(response)) !== null) {
    results.push({
      title: match[1].trim(),
      description: match[2].trim(),
    });
  }
  
  return results;
}
```

---

## Acceptance Criteria

- [ ] Chat works with streaming responses
- [ ] Context includes all upstream nodes
- [ ] System prompt varies by node type
- [ ] Decompose action creates child nodes
- [ ] Plan action generates checkbox list
- [ ] Review action identifies issues
- [ ] Token budget respected (truncation works)
- [ ] Chat history persists per node
- [ ] Loading state shown during API call

---

## Dependencies

- @google/generative-ai v0.21.0 (already installed)
- NEXT_PUBLIC_GEMINI_API_KEY environment variable
- Canvas store for node/edge access
