# VisionPath Vision

> The North Star document. No technical details here—only the "why" and "where."

---

## Mission Statement

**End spatial blindness in software development.**

VisionPath transforms abstract project complexity into a visible, navigable landscape where every goal, feature, and task exists as a tangible object you can see, touch, and connect.

---

## The Problem We Solve

### Spatial Blindness

Developers lose the big picture while focused on small details. A single subtask on Tuesday can silently block a major goal six months away—but you won't see it until it's too late.

### Tool Fragmentation

- Planning happens in Notion, Jira, or Linear
- Coding happens in VS Code or Cursor
- Documentation lives in Confluence or scattered Markdown
- **None of these truly talk to each other**

### Rigid Mental Models

Kanban boards force column thinking. Todo lists force linear thinking. Neither matches the **organic, branching nature** of real project logic.

---

## Our Solution

### Visual Thinking

Projects are **graphs, not lists**. VisionPath renders your project as an infinite canvas where:
- **Nodes** represent thoughts (goals, features, tasks)
- **Cables** represent dependencies (A must complete before B)
- **Clusters** form organically as related work groups together

### AI as Co-Pilot

Every node has an embedded AI agent that:
- Knows exactly where it sits in the project hierarchy
- Only sees relevant upstream context (not the whole codebase)
- Helps decompose, plan, review, and implement

### Territory = Map

Your visual canvas isn't just a picture—it **is** your documentation. Every node mirrors to a Markdown file. Edit the canvas, the files update. Edit the files, the canvas updates.

---

## Target Audience

### Primary: Solo Developers & Small Teams (2-5)

- Building side projects, MVPs, or indie products
- Need to stay organized without heavyweight PM tools
- Want AI assistance that understands project context

### Secondary: Technical Leads

- Managing complex multi-track projects
- Need visual communication tools for stakeholders
- Want to prevent "surprise blockers" from hidden dependencies

### Tertiary: Agencies & Consultants

- Juggling multiple client projects
- Need clear handoff documentation
- Want to demonstrate progress visually

---

## Design Principles

### 1. The Map IS the Territory

The visual representation isn't a view of the data—it IS the data. Moving a node on canvas changes the underlying Markdown. There is no "sync" problem because there's only one source of truth rendered two ways.

### 2. Spatial Memory Over Search

Humans remember "that cluster of nodes in the top-right" better than "Row 42, Column 3." We leverage spatial cognition for faster navigation.

### 3. Context Diet

AI agents only receive upstream context (parent nodes), not the entire project. This keeps token usage efficient and responses relevant.

### 4. Horizontal Flow

Time flows left to right. Goals on the left, completed tasks on the right. This matches natural reading direction and mental models of progress.

### 5. Organic Over Rigid

Nodes float freely with spring physics. No forced grids. Projects grow like organisms, not spreadsheets.

---

## Success Metrics

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Time to First Node | < 30 seconds | Instant value, no setup friction |
| Context Switch Time | 50% reduction | Spatial navigation vs. file hunting |
| Blocked Task Visibility | 100% | All dependencies visible at a glance |
| AI Context Accuracy | > 90% | Right context = right answers |

---

## Current State (February 2026)

### Delivered ✅
- Infinite canvas with 7 node types (goal, subgoal, feature, task, moodboard, notes, connector)
- AI-powered plan generation via Gemini 2.0 Flash
- Rich content: images, PRDs, IDE prompts on any node
- Smart mapping: auto-suggest parent nodes by hierarchy + proximity
- Manual edge connections between nodes
- Guided onboarding questionnaire

### Next Up
- Persistent storage (Firebase/localStorage)
- Real-time collaboration
- VS Code extension (sync active file to node)
- GitHub integration (issues as nodes)
- Template library (starter project canvases)

---

## What VisionPath Is NOT

- ❌ A Kanban board (no columns)
- ❌ A todo app (no flat lists)
- ❌ A mind map (we have typed nodes and validated dependencies)
- ❌ A documentation generator (we sync, not generate)
- ❌ A full IDE (we complement, not replace)

---

## Closing Thought

> "The future of software development is not just about writing code faster—it's about organizing thought better."

VisionPath gives creators a way to manage complexity that feels **human** rather than mechanical.
