# AI Agent Onboarding

> **Read this document FIRST before doing any work on VisionPath.**

---

## Welcome, Agent

You are about to work on **VisionPath**, a visual DAG-based project planning tool. This document explains how the documentation system works and the order in which you should read files before writing any code.

---

## Task Philosophy

**How tasks work in this project:**

| Principle | Rule |
|-----------|------|
| **Sprint Size** | Every task is a 1-2 hour actionable sprint |
| **Single Source** | All tasks live in `PLAN.md` - one place, no scattered lists |
| **Deadlines** | Every task has a deadline or target date |
| **Sequential** | Work tasks in order - don't skip ahead |

When working:
1. Pick the **next uncompleted task** in PLAN.md (top to bottom)
2. Complete it in one focused sprint (1-2 hours max)
3. Mark it done immediately
4. Move to the next task

> ⚠️ **Do NOT cherry-pick tasks.** Work sequentially unless explicitly told otherwise.

---

## The Three Golden Rules

Before you touch anything, internalize these:

### 1. Zero-Inference Policy
> If it isn't in the docs or code, it doesn't exist.

Never assume a function, type, or pattern exists. If you need something that isn't documented, either create it (and document it) or ask the human.

### 2. Atomic Updates
> Documentation and code move in lockstep.

When you complete a task, update `PLAN.md` immediately. Don't batch updates. Don't "finish the session" then update. Update as you go.

### 3. Context Window Diet
> Read only what you need for the current task.

Don't load the entire codebase into context. Follow the reading order below and only deep-dive into relevant SPEC files.

---

## Documentation Map

```
                    ┌─────────────┐
                    │  INTRO.md   │  ◄── YOU ARE HERE
                    │  (Start)    │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ README   │ │ VISION   │ │ARCHITECTURE│
        │ (What)   │ │ (Why)    │ │ (How)     │
        └────┬─────┘ └──────────┘ └─────┬─────┘
             │                          │
             │    ┌─────────────────────┤
             │    │                     │
             ▼    ▼                     ▼
        ┌──────────┐              ┌──────────────┐
        │ PLAN.md  │              │ SPEC_DEFS/   │
        │ (Tasks)  │              │ (Deep Dives) │
        └────┬─────┘              └──────────────┘
             │
             ▼
        ┌──────────────┐
        │ CONTRIBUTING │
        │ (Rules)      │
        └──────────────┘
```

---

## Required Reading Order

### Phase 1: Orientation (Always)

Read these in order to understand what you're building:

| Order | File | Purpose | Time |
|-------|------|---------|------|
| 1 | `INTRO.md` | This file - how to read docs | 2 min |
| 2 | `README.md` | What is VisionPath, quick start | 3 min |
| 3 | `VISION.md` | Why we're building it, who it's for | 3 min |
| 4 | `ARCHITECTURE.md` | Tech stack, data models, patterns | 5 min |

### Phase 2: Current State (Always)

Check what's been done and what's next:

| Order | File | Purpose | Time |
|-------|------|---------|------|
| 5 | `PLAN.md` | Master task checklist - find your task | 3 min |
| 6 | `ROADMAP.md` | Milestone dependencies | 2 min |
| 7 | `LOGS/` (latest) | What happened last session | 2 min |

### Phase 3: Task-Specific (As Needed)

Only read the SPEC file relevant to your current task:

| Task Area | Read This Spec |
|-----------|---------------|
| Canvas setup | `SPEC_DEFS/canvas.md` |
| Node components | `SPEC_DEFS/nodes.md` |
| Physics engine | `SPEC_DEFS/physics.md` |
| File sync | `SPEC_DEFS/file-sync.md` |
| AI chat | `SPEC_DEFS/ai-integration.md` |
| Real-time collab | `SPEC_DEFS/collaboration.md` |

### Phase 4: Before Coding (Always)

| Order | File | Purpose |
|-------|------|---------|
| Last | `CONTRIBUTING.md` | Coding standards, Git workflow |

---

## Quick Reference: File Purposes

| File | One-Line Purpose | Edit Frequency |
|------|------------------|----------------|
| `INTRO.md` | How to read these docs | Rarely |
| `README.md` | Project overview for humans | Rarely |
| `VISION.md` | North star, no tech details | Never (sacred) |
| `ARCHITECTURE.md` | Tech decisions source of truth | When patterns change |
| `PLAN.md` | Living task checklist | **Every task completion** |
| `ROADMAP.md` | Milestone tracking | When milestones shift |
| `CONTRIBUTING.md` | Coding rules | When standards change |
| `SPEC_DEFS/*.md` | Feature deep-dives | When specs evolve |
| `LOGS/*.md` | Session history | End of every session |
| `SESSION_CLOSEOUT.md` | How to end a session | Rarely |

---

## What NOT to Do

❌ **Don't skip to coding** - Read at least Phase 1 and Phase 2 first

❌ **Don't read all SPEC files** - Only read what's relevant to your task

❌ **Don't assume patterns** - Check ARCHITECTURE.md for how we do things

❌ **Don't forget PLAN.md** - Update it as you complete tasks

❌ **Don't invent types** - Check `/types` directory first

❌ **Don't skip the session log** - Read the last one to know where we left off

---

## Starting a Session Checklist

```markdown
## Session Start Checklist

- [ ] Read INTRO.md (this file)
- [ ] Read README.md for project overview
- [ ] Read ARCHITECTURE.md for patterns
- [ ] Check PLAN.md for current task status
- [ ] Read latest LOGS/*.md for context
- [ ] Read relevant SPEC_DEFS/*.md for task details
- [ ] Read CONTRIBUTING.md for coding rules
- [ ] Confirm understanding with human if unclear
```

---

## Asking for Clarification

If something is unclear or missing, ask the human. Good questions:

- "ARCHITECTURE.md mentions X pattern but I don't see it implemented. Should I create it?"
- "PLAN.md shows Task Y as in-progress but I can't find the related code. Where did the last agent leave off?"
- "The spec says to use Z library but it's not in package.json. Should I install it?"

Bad questions (you should already know from docs):

- "What is this project?" → Read README.md
- "What tech stack are we using?" → Read ARCHITECTURE.md
- "What should I work on?" → Read PLAN.md

---

## Ready?

Once you've read this document:

1. Proceed to `README.md`
2. Then `VISION.md` 
3. Then `ARCHITECTURE.md`
4. Then `PLAN.md` to find your task
5. Start working!

At session end, read `SESSION_CLOSEOUT.md` for closeout procedures.
