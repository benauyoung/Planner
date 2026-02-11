# AI Agent Onboarding

> **Read this document FIRST before doing any work on VisionPath.** Updated February 2026.

---

## Welcome

You are working on **VisionPath**, a visual DAG-based project planning tool built with Next.js, React Flow, Zustand, and Gemini AI. This document explains the reading order.

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
| `lib/constants.ts` | NODE_CONFIG for all 7 node types |

---

## Golden Rules

1. **Check types first** — `types/project.ts` and `types/canvas.ts` are the source of truth
2. **Follow store patterns** — see `CONTRIBUTING.md` for the mutation pattern
3. **Always run `npx tsc --noEmit`** — code must type-check before committing
4. **Firebase is optional** — all services are null-guarded, app works in-memory

---

## Current State Summary

- **7 node types**: goal, subgoal, feature, task, moodboard, notes, connector
- **Rich content**: images (base64), rich text (Tiptap), PRDs, IDE prompts
- **AI integration**: onboarding questionnaire + chat planning via Gemini
- **Smart mapping**: auto-suggest parent nodes by hierarchy + proximity
- **Manual connections**: drag edges between node handles
- **localStorage persistence**: state persists via localStorage fallback (Firebase optional)

---

## Starting Work

1. Read `HANDOFF.md` for the full codebase walkthrough
2. Check `PLAN.md` → "Future Work" section for pending tasks
3. Read `CONTRIBUTING.md` for coding conventions
4. Start implementing
