# Implementation Plan: Lovable-Quality Design Page Bot

> Created: February 23, 2026
> Goal: Elevate the Design tab's page-editing chat bot from functional to delightful

---

## Overview

The current bot (`PageChat` sidebar in `design-view.tsx`) is a basic message-bubble UI that
sends instructions to `/api/ai/edit-page` with minimal context. The system prompt is a single
inline sentence. There is no personality, no streaming, no suggested actions, and no undo.

This plan turns it into a first-class product experience — a named AI design partner with full
project context, real-time streaming output, quick-action chips, undo/redo, and a polished UI
that matches the quality bar of tools like Lovable and v0.

---

## Non-Negotiable: Preserve the Helicopter View

The canvas mode (React Flow infinite canvas showing all pages as draggable cards with
navigation edges) MUST be preserved exactly as-is. It is a core feature — the "helicopter
view" of the whole app layout. This plan only adds to canvas mode (Phase 5), never removes
or replaces it. The mode toggle between single and canvas remains in the toolbar.

---

## What "Lovable Quality" Means Here

1. The bot feels like a collaborator, not a text box
2. Responses appear in real time (streaming)
3. The bot understands the whole project, not just one page's HTML
4. Users can undo changes without fear
5. Suggestions guide users toward better edits
6. The UI is visually excellent — personality, spacing, animation, tone
7. Both single mode and canvas mode get the upgrade — neither is removed

---

## Affected Files

| File | Change Type |
|---|---|
| `components/views/design-view.tsx` | Major — rewrite PageChat, add undo stack |
| `app/api/ai/edit-page/route.ts` | Major — streaming response, richer context |
| `prompts/page-generation.ts` | Update — better output quality |
| `services/gemini.ts` | Update — streaming schema for page edits |
| `types/project.ts` | Minor — add htmlHistory to ProjectPage |
| `stores/project-store.ts` | Minor — add undoPageHtml(), htmlHistory |

---

## Implementation Steps

### Phase 1: Undo Stack (foundation — do first)

**Step 1.1: Add HTML history to ProjectPage type**

- File: `types/project.ts`
- Action: Add `htmlHistory?: string[]` field to `ProjectPage` interface
- Rationale: Enables per-page undo without a global state manager

**Step 1.2: Add undoPageHtml() to Zustand store**

- File: `stores/project-store.ts`
- Action: In `updatePageHtml()`, push current html to `htmlHistory` (cap at 20 entries) before
  updating. Add `undoPageHtml(pageId)` that pops the last history entry and restores it.
- Rationale: Confident editing — users try things knowing they can go back

---

### Phase 2: Streaming Edit API

**Step 2.1: Switch edit-page route to streaming**

- File: `app/api/ai/edit-page/route.ts`
- Action: Replace the current `generateContent()` call with `generateContentStream()`. Return a
  `ReadableStream` response with `Transfer-Encoding: chunked`. Stream the html field token by
  token.
- Note: Gemini's `generateContentStream()` yields chunks — accumulate until valid JSON, then
  stream the `html` value progressively.

**Step 2.2: Enrich the request context**

- File: `app/api/ai/edit-page/route.ts`
- Action: Accept additional fields in the request body:
  ```
  {
    currentHtml: string,
    instruction: string,
    pageTitle: string,
    designSystem: string,      // NEW — "Modern SaaS, blue/gray palette"
    allPageTitles: string[],   // NEW — ["Home", "Dashboard", "Pricing"]
    projectDescription: string // NEW — from project store
  }
  ```
- Rationale: Bot can maintain consistency across pages and understand design intent

**Step 2.3: Upgrade the system prompt**

- File: `app/api/ai/edit-page/route.ts`
- Action: Replace the inline one-liner with a rich multi-paragraph prompt:
  - Role: "You are Baguette, TinyBaguette's expert AI design engineer..."
  - Design principles: maintain design system, use Tailwind only, no JavaScript
  - Output format: Return COMPLETE updated body HTML — never partial
  - Tone: Brief, confident summary in 1 sentence (the `summary` field)
  - Consistency: Reference design system description and other pages for cohesion

---

### Phase 3: Bot UI Overhaul (PageChat component)

**Step 3.1: Named bot identity + header**

- File: `components/views/design-view.tsx`
- Action: Update PageChat header to show bot name "Baguette" with a small icon/avatar (a
  baguette emoji or inline SVG), current page name as subtitle, and undo button (if history
  exists).
- Layout:
  ```
  [🥖 Baguette]  [undo ↩]  [✕]
   Editing: Home
  ```

**Step 3.2: Beautiful empty state with quick-action chips**

- File: `components/views/design-view.tsx`
- Action: When `messages.length === 0`, show an empty state:
  - Greeting: "Hi, I'm Baguette. Tell me what to change on this page."
  - 6 quick-action chips below the greeting:
    - "Make it dark mode"
    - "Add a pricing section"
    - "Add a contact form"
    - "Make the header sticky"
    - "Add social proof"
    - "Improve the hero"
  - Clicking a chip sends it as a message instantly
- Rationale: Removes blank-page anxiety, guides users to good first edits

**Step 3.3: Typing indicator**

- File: `components/views/design-view.tsx`
- Action: While `isLoading`, show a "Baguette is designing..." indicator with three animated
  dots (CSS keyframe bounce stagger). Replace the generic spinner.

**Step 3.4: Streaming HTML preview**

- File: `components/views/design-view.tsx`
- Action: In `handleSend()`, switch from `await fetch()` to `ReadableStream` consumption.
  As chunks arrive, accumulate the HTML and call `updatePageHtml(pageId, partialHtml)` every
  ~500ms so the iframe updates in real time while the bot is still generating.
- Rationale: The page visibly building itself feels magical

**Step 3.5: Message polish**

- File: `components/views/design-view.tsx`
- Action:
  - AI messages: Show bot avatar (small 🥖 icon), `summary` text from response, subtle
    "Page updated" chip in green at the bottom of the message
  - User messages: Right-aligned, slightly smaller, muted timestamp
  - After each AI message: Show 2-3 contextual follow-up chips based on what was just changed
    (e.g., after "make it dark" → chips: "Adjust text contrast", "Update button colors",
    "Add dark mode toggle")

**Step 3.6: Pass full context from design-view to API**

- File: `components/views/design-view.tsx`
- Action: In `handleSend()`, include `designSystem`, `allPageTitles`, and `projectDescription`
  in the POST body alongside the existing fields.

---

### Phase 4: Generation Quality Upgrade

**Step 4.1: Improve page-generation system prompt**

- File: `prompts/page-generation.ts`
- Action: Expand the prompt with:
  - Explicit design system extraction: define a palette (3 colors), type scale (3 sizes),
    and spacing unit before generating any pages
  - Richer component patterns: hero with gradient mesh, feature grids, testimonials,
    pricing cards, animated CTAs
  - Depth instruction: "Each page should feel complete — not a wireframe. Add realistic
    microcopy, human names, real numbers, believable data."
  - Consistency rule: All pages must share the same nav, footer, color palette, and
    type scale derived from `designSystem`

**Step 4.2: Show design system in sidebar**

- File: `components/views/design-view.tsx`
- Action: In single mode's left sidebar, render the `designSystem` string with a small
  color swatch row extracted by parsing any hex/color keywords from the string. Makes the
  design token visible and editable.

---

### Phase 5: Canvas Mode Chat (inline edit upgrade — helicopter view preserved)

The canvas mode (React Flow layout, draggable page cards, navigation edges, agents panel)
is kept entirely intact. Only the inline edit bar on each page card is upgraded.

**Step 5.1: Upgrade inline edit bar on page cards**

- File: `components/views/design-canvas.tsx`
- Action: Replace the plain text input on page cards with a mini Baguette chat bar —
  same quick-action chips, same streaming preview, same undo button. The page card
  itself, its iframe preview, drag behavior, edge connections, and canvas layout are
  untouched. Reuse the same API and streaming logic from Phase 2.

---

## Quick-Action Chip System (reusable)

Create a small `DesignChips` component (`components/views/design-chips.tsx`) that accepts:

```typescript
interface DesignChipsProps {
  chips: string[]
  onSelect: (chip: string) => void
}
```

Used in both the empty state and the post-message follow-ups. Chips are:
- Small pill buttons, 12px text, muted background
- Primary accent on hover
- Overflow-wrap to multiple rows with `flex-wrap`

---

## Testing Strategy

- [ ] Page edits apply correctly and iframe updates
- [ ] Undo restores previous HTML (test 3 levels deep)
- [ ] Streaming shows incremental iframe updates
- [ ] Quick-action chips fire as messages correctly
- [ ] Design system context passes through to API (check network tab)
- [ ] Canvas inline edit uses same streaming behavior
- [ ] Empty state shows on first open and hides after first message
- [ ] TypeScript: `npx tsc --noEmit` passes

---

## Rollback Plan

All changes are additive except the streaming switch in `edit-page/route.ts`. If streaming
causes issues, the route can be reverted to `generateContent()` in one line. The undo stack
is non-destructive — htmlHistory is optional on the type.

---

## Estimated Complexity

**Medium-High** — 5 phases, touches 6 files. The streaming implementation is the riskiest
piece (Gemini streaming + ReadableStream in Next.js edge routes). Everything else is
incremental UI polish on top of the existing architecture.

Suggested order: Phase 1 → Phase 3.1-3.3 → Phase 2 → Phase 3.4-3.6 → Phase 4 → Phase 5

---

## Plan ID

`design-bot-lovable`
Use `/execute-plan design-bot-lovable` to begin implementation.
