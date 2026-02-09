# Session Closeout Procedures

> **Read this document when you are ending a work session.** Follow these procedures to ensure clean handoff to the next agent or human.

---

## Session Log Format (Quick Reference)

**File location:** `LOGS/YYYY-MM-DD-session.md`  
**Template location:** `LOGS/_template.md`

```markdown
---
date: YYYY-MM-DD
session: [number]
agent: [name]
duration: Xh Xm
---

# Session Log - YYYY-MM-DD

## Objective
[Goal for this session]

## Outcome
### Completed
- [x] Task 1

### In Progress  
- [~] Task 2 - [state]

### Blocked
- [!] Task 3 - [reason]

## Files Modified
| File | Change |
|------|--------|
| `file.ts` | Description |

## Next Steps
1. [ ] Priority 1
2. [ ] Priority 2

## Warnings
- [Anything the next agent should avoid]
```

> ⚠️ **Always check `LOGS/_template.md` for the full template with all sections.**

---

## When to Trigger Closeout

Initiate closeout when:

- ✅ The human says "end session", "wrap up", "that's all for now"
- ✅ You've completed the assigned task(s)
- ✅ You're blocked and cannot proceed without human input
- ✅ You've been working for an extended period (natural stopping point)
- ✅ The human is switching to a different agent/tool

---

## Closeout Checklist

Complete these steps IN ORDER before ending the session:

### Step 1: Update PLAN.md ⚡ CRITICAL

```markdown
- [ ] Mark completed tasks as [x]
- [ ] Mark in-progress tasks as [~] with note
- [ ] Add any new tasks discovered during session
- [ ] Ensure no task is left in ambiguous state
```

**Example update:**
```diff
- [ ] Create canvasStore with CRUD operations
+ [x] Create canvasStore with CRUD operations
- [ ] Implement GoalNode component
+ [~] Implement GoalNode component (styling done, handles pending)
```

### Step 2: Verify Code State

```markdown
- [ ] All files saved
- [ ] No syntax errors in modified files
- [ ] Code compiles/type-checks (run `pnpm type-check` if available)
- [ ] No commented-out debug code left behind
- [ ] No TODO comments without corresponding PLAN.md entry
```

### Step 3: Create Session Log

Create a new file: `LOGS/YYYY-MM-DD-session.md`

Use this template:

```markdown
---
date: YYYY-MM-DD
session: [number if multiple sessions same day]
agent: [Your name/identifier]
duration: [Approximate time spent]
---

# Session Log - YYYY-MM-DD

## Objective

[What was the goal for this session?]

## Outcome

### Completed
- [x] Task 1
- [x] Task 2

### In Progress
- [~] Task 3 - [current state and what's left]

### Blocked
- [!] Task 4 - [why it's blocked]

## Files Modified

| File | Change |
|------|--------|
| `path/to/file.ts` | Description |

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Chose X | Because Y |

## Blockers

[List any issues preventing progress]

## Next Steps

1. [ ] First priority for next session
2. [ ] Second priority
3. [ ] Third priority

### Files to Read First
- `path/to/important/file.ts`
- Relevant section of ARCHITECTURE.md

### Warnings
- Don't do X because Y
- Watch out for Z

## Notes

[Any additional observations]
```

### Step 4: Update ROADMAP.md (If Milestone Changed)

Only update if:
- A milestone was completed
- A milestone status changed (started, blocked)
- Dependencies shifted

### Step 5: Git Commit (If Applicable)

If the project uses Git and you have permission:

```bash
git add -A
git commit -m "feat(scope): description

- Bullet point of change 1
- Bullet point of change 2

Session: YYYY-MM-DD"
```

Follow commit conventions in `CONTRIBUTING.md`.

### Step 6: Final Summary to Human

Provide a brief verbal summary:

```markdown
## Session Complete

**Completed:**
- [List main accomplishments]

**In Progress:**
- [What's partially done]

**Blocked:**
- [What needs human attention]

**Next Session Should:**
1. [First priority]
2. [Second priority]

**Files to review:** [list if any need human review]
```

---

## Closeout Templates

### Clean Completion (All Tasks Done)

```markdown
## Session Complete ✅

All assigned tasks completed successfully.

**Completed:**
- Implemented X feature
- Added Y functionality  
- Fixed Z bug

**No blockers.**

**Next session can proceed to:** [Next PLAN.md task]

Session log created: `LOGS/2025-01-15-session.md`
```

### Partial Completion (Some Tasks Remain)

```markdown
## Session Complete ⏸️

Made progress but not all tasks finished.

**Completed:**
- Task A
- Task B

**In Progress:**
- Task C - 70% done, need to finish X

**Remaining:**
- Task D - not started

**No blockers.**

Session log created: `LOGS/2025-01-15-session.md`
```

### Blocked (Cannot Proceed)

```markdown
## Session Paused 🚫

Blocked and need human input.

**Completed:**
- Task A

**Blocked on:**
- Task B requires [specific information/decision]
- Cannot proceed until [condition]

**Questions for human:**
1. Should we use X or Y approach?
2. What is the expected behavior for Z?

**Do not attempt:** [what to avoid]

Session log created: `LOGS/2025-01-15-session.md`
```

---

## Common Closeout Mistakes

❌ **Forgetting PLAN.md** - Always update before ending

❌ **Vague session logs** - Be specific about what was done and what's next

❌ **No next steps** - Always leave clear instructions

❌ **Uncommitted changes** - Don't leave work in limbo

❌ **Debug code left in** - Clean up console.logs and test code

❌ **Broken state** - Don't end with compile errors

---

## Emergency Closeout

If you must end abruptly (human leaves, system issue):

1. **Immediately** save any open files
2. Add a quick note to PLAN.md: `[!] Session ended unexpectedly - see notes`
3. Create minimal session log with:
   - What was being worked on
   - Current state of that work
   - Any critical warnings

```markdown
---
date: YYYY-MM-DD
agent: [name]
status: EMERGENCY CLOSEOUT
---

# Emergency Session Log

**Was working on:** [task]

**Current state:** [where it left off]

**Files in flux:**
- `path/to/file.ts` - [state: incomplete/broken/working]

**WARNING:** [any critical issues]

**To resume:** [what next agent needs to know]
```

---

## Verification Questions

Before saying "session complete", ask yourself:

1. ✅ Is PLAN.md updated with current status?
2. ✅ Is there a session log for today?
3. ✅ Would a new agent know exactly where to start?
4. ✅ Are there any files in a broken state?
5. ✅ Did I document any decisions made?
6. ✅ Are blockers clearly identified?

If any answer is "no", fix it before closing out.

---

## Quick Closeout Command

For the human - if you need a quick closeout, just say:

> "Do a full closeout"

The agent will:
1. Update PLAN.md
2. Create session log
3. Provide summary
4. List next steps
