# Implementation Plan: Architecture View

## Overview

Add an **Architecture** top-level view to TinyBaguette where the AI holds a conversational discussion about the project's technical architecture. The AI proactively leads the discussion, suggesting topics and proposing decisions, while adapting to the user's technical level -- going granular when the user can handle it, offering plain-language explanations when they ask. Accepted decisions become structured data on the project and feed into PRD generation context.

**Approach**: Chat-based (like Design view), not canvas-based. The AI streams responses with embedded decision proposals. A left panel displays all decisions grouped by category with accept/reject controls. On first open, the AI auto-generates initial architecture ideas from existing project context (onboarding answers, nodes, description).

**Key user decisions:**
- AI should be conversational and proactive -- it drives the discussion, suggests topics
- Granular decisions (e.g., "PostgreSQL" + "Drizzle ORM" as separate decisions, not one blob)
- Offer explanations when users don't understand something
- Auto-generate initial proposals from existing project context
- Leave Backend view independent (no cross-wiring for now)
- Accepted decisions can be edited freely without flipping status
- Architecture tab sits right next to Plan in the toolbar (Plan | Architecture | Design | Agents | Manage)


## Prerequisites

- Need to add architecture types + fields to `Project` interface


## Implementation Steps

### Phase 1: Data Layer (types + store)

**Step 1.1: Add architecture types and fields to Project**
- File: `types/project.ts`
- Action:
  - Add `ArchitectureCategory` type (12 categories: frontend, backend, database, auth, deployment, state_management, api_design, file_structure, testing, third_party, caching, other)
  - Add `ArchitectureStatus` type (proposed, accepted, rejected)
  - Add `ArchitectureDecision` interface (id, category, title, description, rationale, alternatives?, status, createdAt, updatedAt)
  - Add `ArchitectureChatMessage` interface (id, role, content, timestamp, decisions?)
  - Add to `Project`: `architectureDecisions?: ArchitectureDecision[]` and `architectureChatMessages?: ArchitectureChatMessage[]`
- Rationale: Persistence -- decisions and chat history live on the project like pages, agents, backendModules

**Step 1.2: Add architecture store mutations**
- File: `stores/project-store.ts`
- Action: Add to ProjectState interface + implementation:
  - `setArchitectureDecisions(decisions: ArchitectureDecision[])` -- bulk set (used after AI generation)
  - `addArchitectureDecision(decision: ArchitectureDecision)` -- append single
  - `updateArchitectureDecision(id: string, updates: Partial<ArchitectureDecision>)` -- edit title/desc/rationale freely (no status change)
  - `setArchitectureDecisionStatus(id: string, status: ArchitectureStatus)` -- accept/reject/proposed
  - `removeArchitectureDecision(id: string)` -- delete
  - `addArchitectureChatMessage(msg: ArchitectureChatMessage)` -- append to chat
  - `clearArchitectureChatMessages()` -- reset chat
- Rationale: Follows existing patterns (agents, backend modules). Use `commitProjectUpdate` for decisions (undoable), `applyWithoutUndo` for chat messages (like appChatMessages)


### Phase 2: AI Backend (prompt + context + route)

**Step 2.1: Create architecture system prompt**
- File: `prompts/architecture-system.ts`
- Action: Create system prompt that:
  - Defines the AI as a friendly, opinionated solutions architect
  - **Proactive**: leads the conversation, suggests what to discuss next, proposes decisions without waiting
  - **Adaptive granularity**: defaults to granular (one decision per specific choice), but if the user seems overwhelmed, consolidates. E.g., "Use PostgreSQL" and "Use Drizzle ORM" are separate decisions
  - **Explains on demand**: when user asks "what does that mean?" or "why?", provides clear plain-language explanations with analogies
  - **Auto-generate mode**: when receiving `isInitial: true`, generates 4-8 initial architecture proposals based on project context without asking questions first
  - Covers 12 categories: frontend, backend, database, auth, deployment, state_management, api_design, file_structure, testing, third_party, caching, other
  - Uses streaming text format with markers:
    ```
    MESSAGE: [conversational response -- can be multi-paragraph]
    DECISIONS:
    ---
    CATEGORY: frontend
    TITLE: Use Next.js App Router
    DESCRIPTION: Server-side rendering with React Server Components for the main application shell.
    RATIONALE: Your project needs SEO for marketing pages and fast initial loads for the dashboard. App Router gives you both with RSC.
    ALTERNATIVES: Remix | Vite + React SPA | Astro with React islands
    ---
    ```
  - DECISIONS block is optional -- conversational messages without new decisions just have MESSAGE
- Rationale: Streaming with markers allows real-time chat updates while still extracting structured decisions

**Step 2.2: Create context builder for architecture**
- File: `lib/architecture-context.ts`
- Action: Create `buildArchitectureContext(project: Project)` that assembles:
  - Project title + description
  - All plan nodes (type + title + description, grouped by hierarchy)
  - Existing architecture decisions (grouped by category, with status)
  - Tech keywords extracted from Q&A answers (reuse pattern from node-context.ts)
  - Onboarding answers if available (project type, audience, timeline, priorities)
- Rationale: Rich context produces better architecture recommendations; separate file keeps node-context.ts clean

**Step 2.3: Create architecture chat API route**
- File: `app/api/ai/architecture-chat/route.ts`
- Action: Create POST route that:
  - Accepts: `{ message, isInitial?, projectTitle, projectDescription, nodes[], existingDecisions[], chatHistory[] }`
  - When `isInitial` is true, prepends "Based on what you know about this project, propose initial architecture decisions" to the user message
  - Builds context string using `buildArchitectureContext()`
  - Uses Gemini 2.0 Flash with `generateContentStream()`
  - Streams back plain text with MESSAGE/DECISIONS markers
  - Returns ReadableStream response (same pattern as edit-page)
- Rationale: Streaming enables real-time chat feel; markers enable structured extraction on client


### Phase 3: UI (view + toolbar wiring)

**Step 3.1: Add 'architecture' to ViewType**
- File: `stores/ui-store.ts`
- Action: Add `'architecture'` to the `ViewType` union type

**Step 3.2: Add Architecture tab to toolbar -- next to Plan**
- File: `components/project/project-toolbar.tsx`
- Action: Insert `{ value: 'architecture', label: 'Architecture', icon: <Blocks className="h-3.5 w-3.5" /> }` into VIEW_OPTIONS as the second item (after Plan, before Design)
  ```
  Plan | Architecture | Design | Agents | Manage
  ```
- Rationale: Architecture is the logical next step after planning -- you plan what to build, then decide how to build it

**Step 3.3: Wire Architecture view in workspace**
- File: `components/project/project-workspace.tsx`
- Action:
  - Add dynamic import: `const ArchitectureView = dynamic(() => import('@/components/views/architecture-view').then(m => ({ default: m.ArchitectureView })), { ssr: false, loading: () => <ViewSkeleton /> })`
  - Add render case: `{currentView === 'architecture' && <ErrorBoundary compact><ArchitectureView /></ErrorBoundary>}`

**Step 3.4: Build the Architecture view component**
- File: `components/views/architecture-view.tsx`
- Action: Create component with two-column layout:

  **Left column (flex-1): Decision Board**
  - Category sections, each collapsible with icon + title + decision count badge
  - Each decision card:
    - Title (bold) + category badge
    - Description text
    - Rationale in a muted/indented block
    - Alternatives listed as small pills/tags
    - Status controls: Accept (check) / Reject (x) / Proposed (default) -- simple icon buttons
    - Edit button -- makes title, description, rationale editable inline
    - Delete button (trash icon, small)
  - Empty state: friendly message + "Start a conversation" prompt, or auto-trigger initial generation
  - Summary bar at top: "X decisions (Y accepted, Z proposed)"
  - **Category color scheme**:
    - frontend: blue, backend: green, database: amber, auth: red
    - deployment: purple, state_management: cyan, api_design: indigo
    - file_structure: orange, testing: lime, third_party: pink, caching: teal, other: gray

  **Right column (w-96, border-l): Chat Panel**
  - Chat message list (user + assistant bubbles, scrollable)
  - Input bar at bottom with send button
  - Streaming response: update assistant bubble text in real-time as MESSAGE content arrives
  - On stream complete: parse DECISIONS blocks, create ArchitectureDecision objects (status: 'proposed'), save to store via `addArchitectureDecision()`, attach to chat message
  - **Auto-generation on first open**: if `architectureChatMessages` is empty and project has nodes, auto-send an initial request with `isInitial: true` to generate starting proposals
  - **Starter prompts** (shown when chat is empty, before auto-gen completes):
    - "What tech stack fits my project?"
    - "How should I handle authentication?"
    - "What database should I use?"
    - "Help me plan my API structure"
  - When user clicks a starter prompt, it sends as a message

- Rationale: Chat-driven architecture discussion with persistent, categorized decision cards. Two-column keeps decisions visible while chatting. Auto-generation gives immediate value.


### Phase 4: PRD Integration

**Step 4.1: Feed architecture context into PRD generation**
- File: `lib/node-context.ts`
- Action: In `buildNodeContext()`, add a new section after "Tech Context" that includes accepted architecture decisions:
  ```
  ## Architecture Decisions
  - [frontend] Next.js App Router (accepted): Server-side rendering with RSC...
  - [database] PostgreSQL with Drizzle ORM (accepted): Type-safe queries...
  ```
  Only include decisions with status === 'accepted'. Group by category.
- Rationale: PRDs should reflect the agreed-upon architecture without the user repeating themselves

**Step 4.2: Feed architecture into page design context**
- File: `app/api/ai/edit-page/route.ts`
- Action: Accept optional `architectureDecisions` in request body, include accepted decisions in the context string sent to Gemini
- Rationale: Design pages should respect architecture decisions (e.g., chosen CSS framework, component library)


## Testing Strategy

- [ ] Architecture tab appears in toolbar between Plan and Design
- [ ] Clicking tab switches to Architecture view with two-column layout
- [ ] On first open with existing project nodes, auto-generates initial proposals
- [ ] Streaming chat response appears in real-time in the chat panel
- [ ] Decisions extracted from stream appear as "proposed" cards on the left
- [ ] Accept/reject toggles work and persist after reload
- [ ] Inline editing of accepted decisions works without status change
- [ ] Delete removes a decision
- [ ] Asking "what does X mean?" gets a clear explanation without new decisions
- [ ] PRD generation for a node includes accepted architecture decisions in context
- [ ] TypeScript check: `npx tsc --noEmit` passes cleanly


## Rollback Plan

All changes are additive (new files + new optional fields on Project). To roll back:
1. Remove `architecture-view.tsx`, `architecture-context.ts`, `architecture-system.ts`, `architecture-chat/route.ts`
2. Remove `'architecture'` from ViewType and VIEW_OPTIONS
3. Remove architecture store mutations
4. Remove architecture types + fields from Project interface
5. Revert node-context.ts and edit-page/route.ts changes

No data migration needed -- fields are optional with `?`.


## Estimated Complexity

**Medium** -- 11 files to create/modify, but the patterns are well-established in the codebase (backend-view, design-view, agents-view). The streaming + marker parsing is proven in edit-page. Main effort is the view component and prompt quality.


## File Summary

| File | Action | Phase |
|---|---|---|
| `types/project.ts` | Add types + fields to Project | 1 |
| `stores/project-store.ts` | Add 7 architecture mutations | 1 |
| `prompts/architecture-system.ts` | New -- system prompt | 2 |
| `lib/architecture-context.ts` | New -- context builder | 2 |
| `app/api/ai/architecture-chat/route.ts` | New -- streaming API route | 2 |
| `stores/ui-store.ts` | Add 'architecture' to ViewType | 3 |
| `components/project/project-toolbar.tsx` | Add tab next to Plan | 3 |
| `components/project/project-workspace.tsx` | Wire view | 3 |
| `components/views/architecture-view.tsx` | New -- main view component | 3 |
| `lib/node-context.ts` | Add architecture to PRD context | 4 |
| `app/api/ai/edit-page/route.ts` | Pass architecture to design | 4 |
