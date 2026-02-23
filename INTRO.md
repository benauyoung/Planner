# AI Agent Onboarding

> **Read this document FIRST before doing any work on TinyBaguette.** Updated February 23, 2026.

---

## Welcome

You are working on **TinyBaguette**, an AI-powered **plan-to-product platform** built with Next.js, React Flow, Zustand, and Gemini AI.

TinyBaguette has **three co-equal pillars** — treat them all as first-class:

1. **PLAN** — AI builds a hierarchical DAG on an interactive canvas. Users refine through chat, questions, and context-aware PRDs.
2. **DESIGN** — AI generates real HTML+Tailwind pages rendered as live srcdoc iframes. Canvas mode (sitemap) + single-page mode (iterate with AI chat).
3. **AGENTS** — Users build AI chatbot agents and **drag them onto Design canvas pages** to embed as chat widgets.

These are not separate features — they form a feedback loop. Never treat Design or Agents as secondary to Plan.

---

## Essential Reading Order

| Order | File | Purpose | Time |
|-------|------|---------|------|
| 1 | `INTRO.md` | This file — how to navigate docs | 1 min |
| 2 | `HANDOFF.md` | **Most important** — full codebase walkthrough, data models, flows | 5 min |
| 3 | `ARCHITECTURE.md` | Tech stack, component tree, store methods | 5 min |
| 4 | `PLAN.md` | What's built (✅) and what's pending ([ ]) | 2 min |
| 5 | `CONTRIBUTING.md` | Code style, naming, store patterns | 2 min |

### Optional
| File | When to Read |
|------|-------------|
| `README.md` | Quick project overview |
| `VISION.md` | Product goals and target audience |
| `ROADMAP.md` | Milestone tracking |
| `archive/SPEC_DEFS/*.md` | Archived specs — all implemented, use `ARCHITECTURE.md` instead |

---

## Key Files to Understand

| File | Why It Matters |
|------|---------------|
| `types/project.ts` | Canonical data model: PlanNode, NodePRD, NodePrompt, Project |
| `stores/project-store.ts` | All state mutations — the heart of the app |
| `components/canvas/graph-canvas.tsx` | Main canvas with context menus, onConnect, layout |
| `components/panels/node-detail-panel.tsx` | Detail panel with PRDs, prompts, images |
| `lib/constants.ts` | NODE_CONFIG for all 12 node types |

---

## Golden Rules

1. **Check types first** — `types/project.ts` and `types/canvas.ts` are the source of truth
2. **Follow store patterns** — see `CONTRIBUTING.md` for the mutation pattern
3. **Always run `npx tsc --noEmit`** — code must type-check before committing
4. **Firebase is optional** — all services are null-guarded, app works in-memory

---

## Current State Summary (v0.9.9 ✅)

### PLAN Pillar
- **12 node types**, **8 edge types**, AI chat planning, iteration, smart suggestions
- Deep question flow per node, context-aware PRD generation, PRD Pipeline with stale detection
- Multi-select + bulk actions, spring physics layout, level-of-detail zoom
- Territory file sync: bidirectional canvas ↔ Markdown with diff review
- Blast radius, smart mapping, command palette (Cmd+K), Ralphy export
- Rich content: images, PRDs, IDE prompts, Notion-style embedded docs
- Team management, comments, activity feed, sprint planning, version history
- Export (JSON, Markdown, .cursorrules, CLAUDE.md), import (JSON, Markdown)
- Shareable plans, template library (3 seed templates)

### DESIGN Pillar
- AI generates HTML+Tailwind pages via srcdoc iframes (no WebContainer)
- Canvas mode (all pages on React Flow canvas) + single-page mode (viewport switcher + PageChat)
- Inline AI editing, delete, focus, select-to-chat on canvas page nodes
- Agent drag-and-drop: inject chat widget HTML onto pages

### AGENTS Pillar
- Full agent builder: Config, Knowledge, Theme, Preview, Deploy tabs
- AI-assisted generation, live chat preview, one-click deploy with embed snippet
- Drag-and-drop onto Design canvas pages

### Infrastructure
- 4 view tabs (Plan, Design, Agents, Manage) with 6 Manage sub-views
- Firebase Firestore with runtime failover to localStorage
- Collaboration infrastructure (presence, cursors, pluggable provider)
- Integration settings UI (GitHub, Slack, Linear — OAuth pending)
- Public landing page with interactive showcase
- Unified toolbar: project name, save status, view tabs, action icons

---

## Starting Work

1. Read `HANDOFF.md` for the full codebase walkthrough
2. Check `PLAN.md` → "Future Work" section for pending tasks
3. Read `CONTRIBUTING.md` for coding conventions
4. Start implementing
