# AI Agent Onboarding

> **Read this document FIRST before doing any work on TinyBaguette.** Updated February 16, 2026.

---

## Welcome

You are working on **TinyBaguette**, a visual DAG-based project planning tool built with Next.js, React Flow, Zustand, and Gemini AI. This document explains the reading order.

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
| `SPEC_DEFS/*.md` | Legacy specs — some outdated, use `ARCHITECTURE.md` instead |

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

## Current State Summary (v0.9.6 ✅)

- **12 node types**: goal, subgoal, feature, task, moodboard, notes, connector, spec, prd, schema, prompt, reference
- **4 view tabs** (Plan, Design, Agents, Manage) with **6 Manage sub-views** (List, Table, Board, Timeline, Sprints, Backend)
- **8 edge types**: hierarchy, blocks, depends_on, informs, defines, implements, references, supersedes
- **AI features**: onboarding, chat planning, PRD/prompt generation, iteration loops, smart suggestions, page generation
- **Rich content**: images (base64), rich text (Tiptap), PRDs, IDE prompts, Notion-style embedded docs
- **Team features**: assignees, priority, due dates, estimates, tags, comments, activity feed
- **Sprint planning**: create sprints, drag tasks from backlog, progress tracking
- **Version history**: save/restore named snapshots with branch support
- **Collaboration infra**: pluggable provider architecture (real-time WebSocket backend pending)
- **Integrations**: settings UI shell (service clients removed; OAuth flows pending)
- **Command palette**: Cmd+K fuzzy search with keyboard shortcuts
- **Export**: JSON, Markdown, .cursorrules, CLAUDE.md, plan.md, tasks.md
- **Import**: JSON projects, Markdown specs (paste/upload with preview)
- **Shareable plans**: public toggle + read-only share URL
- **Template library**: 3 seed templates (Auth System, CRUD API, Landing Page)
- **Persistence**: Firebase Firestore with runtime failover to localStorage
- **Landing page**: interactive showcase, one-shot pipeline section
- **Unified toolbar**: project name, save status, view tabs, action icons

---

## Starting Work

1. Read `HANDOFF.md` for the full codebase walkthrough
2. Check `PLAN.md` → "Future Work" section for pending tasks
3. Read `CONTRIBUTING.md` for coding conventions
4. Start implementing
