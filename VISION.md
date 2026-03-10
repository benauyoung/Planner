# TinyBaguette Vision

> The North Star document. No technical details here—only the "why" and "where."

---

## Mission Statement

**End spatial blindness in software development.**

TinyBaguette transforms abstract project complexity into a visible, navigable landscape where every goal, feature, and task exists as a tangible object you can see, touch, and connect.

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

## Our Solution: The Three Pillars

TinyBaguette is a **plan-to-product platform** built around three co-equal pillars that form a feedback loop:

### 1. PLAN (The DAG Canvas)
Projects are **graphs, not lists**. Users describe an idea, AI builds a hierarchical DAG (goals → subgoals → features → tasks) on an interactive canvas. Users refine through chat, answer AI-generated questions per node, and generate context-aware PRDs that know about each other. The plan is the backbone — but it is NOT the whole product.

### 2. DESIGN (Live Visual Builder)
AI generates actual working web pages (HTML + Tailwind CSS) from the project plan, rendered as live `srcdoc` iframes. Canvas mode shows all pages on a zoomable React Flow canvas like an interactive sitemap. Single-page mode lets you zoom in and iterate with AI chat. This is not a mockup tool — it generates real code.

### 3. AGENTS (Embeddable AI Chatbots)
Users build AI chatbot agents with persona, knowledge base, behavior rules, and theme. The key differentiator: **agents are dragged directly onto Design canvas pages** to embed them as floating chat widgets. Plan your app, design your pages, drop intelligent chatbots onto them — all without leaving TinyBaguette.

### How They Connect
- **Plan → Design**: The DAG tells the design generator what pages to create and what they should contain.
- **Design → Plan**: Editing a page's content or structure can update the corresponding PRD and node details.
- **Agents → Design**: Agents deploy by dragging onto Design canvas pages, injecting widget HTML into the page code.
- **Plan → Export**: Interconnected PRDs export as packages for Claude Code, Cursor, Ralphy, or generic IDEs.

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

### 4. Vertical Flow

Goals at the top, tasks at the bottom. The hierarchy flows top-to-bottom, matching how people think about decomposition — big picture above, details below.

### 5. Organic Over Rigid

Nodes float freely with organic layout. No forced grids. Projects grow like organisms, not spreadsheets.

---

## Success Metrics

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Time to First Node | < 30 seconds | Instant value, no setup friction |
| Context Switch Time | 50% reduction | Spatial navigation vs. file hunting |
| Blocked Task Visibility | 100% | All dependencies visible at a glance |
| AI Context Accuracy | > 90% | Right context = right answers |

---

## Current State (v0.9.12, March 2026)

### PLAN Pillar ✅
- Infinite canvas with 12 node types and 8 typed edge types
- AI-powered plan generation, iteration, smart suggestions
- Deep question flow per node with category-aware follow-ups and readiness badges
- Context-aware PRD generation — each PRD knows about parent/sibling/child/dependency PRDs
- PRD Pipeline panel with status tracking, stale detection, Ralphy export
- Multi-select + bulk actions (rubber-band, Shift+click, Ctrl+A, BulkActionsBar)
- Spring physics force-directed layout + Dagre tree layout toggle
- Level-of-detail zoom (full → compact → dot)
- Territory file sync: bidirectional canvas ↔ Markdown with diff review
- Blast radius analysis, smart mapping, command palette (Cmd+K)
- Rich content: images, PRDs, IDE prompts, Notion-style embedded docs
- Team management, comments, activity feed, sprint planning, version history
- Export (JSON, Markdown, .cursorrules, CLAUDE.md) and import (JSON, Markdown)
- Shareable plans via public read-only URL, template library (3 seed templates)

### DESIGN Pillar ✅
- AI generates HTML+Tailwind pages from plan via srcdoc iframes (no WebContainer)
- Canvas mode: all pages on zoomable React Flow canvas with navigation edges
- Single-page mode: viewport switcher (Desktop/Tablet/Mobile) + PageChat sidebar
- Inline AI editing, delete, focus, select-to-chat on canvas page nodes
- Add Page dialog: AI generates new pages matching design system
- Agent drag-and-drop: inject chat widget HTML onto pages

### AGENTS Pillar ✅
- Full agent builder: Config, Knowledge, Theme, Preview, Deploy tabs
- AI-assisted agent generation from description
- Live chat preview with Gemini backend
- One-click deploy with embed snippet
- Drag-and-drop onto Design canvas pages

### Infrastructure ✅
- 4 view tabs (Plan, Design, Agents, Manage) with 6 Manage sub-views
- Firebase persistence with runtime failover to localStorage
- Collaboration infrastructure (presence avatars, live cursors, pluggable provider)
- Integration settings UI (GitHub, Slack, Linear — OAuth flows pending)
- Public landing page with interactive showcase

### Landing Page (v0.9.12) ✅
- Hero copy clarified for software context ("Describe your app or website idea...")
- Showcase animations calmed (no more auto-cycling, static pre-selection)
- Email gate less aggressive (25 actions, 3s delay, dismissable)
- Post-email "View your plan" button for returning to generated roadmap

### Next Up (v1.0)
- Legacy WebContainer code cleanup
- Performance + accessibility audit
- E2E test coverage

---

## What TinyBaguette Is NOT

- ❌ A PRD generator — it's a full plan-to-product platform
- ❌ A Kanban board (no columns)
- ❌ A todo app (no flat lists)
- ❌ A mind map (we have typed nodes and validated dependencies)
- ❌ A mockup tool — the Design tab generates real code
- ❌ A full IDE (we complement, not replace)
- ❌ Three siloed tabs — Plan, Design, and Agents are interconnected pillars

---

## Closing Thought

> "The future of software development is not just about writing code faster—it's about organizing thought better."

TinyBaguette gives creators a way to manage complexity that feels **human** rather than mechanical.
