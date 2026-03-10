# Implementation Plan: Pokopia Vibe Wrapper + Image Generation (EXECUTED - Session 6)

## Overview

Two changes to the page generator:

1. **Pokopia Vibe Wrapper** - Restyle the system prompts (both `generate-pages` and `edit-page`) to enforce a Pokopia aesthetic: soft/rounded kawaii UI, candy pastel colors, cozy warmth, playful micro-interactions, sticker-style elements. Output quality stays at Lovable-level (production polish, real data, depth).

2. **Image Generation** - Add a `/api/ai/generate-image` route using Gemini's native image generation. The page generator will emit `<img>` tags with descriptive `data-generate` attributes; a post-processing step generates images and injects them as base64 data URLs.

---

## Prerequisites

- Current Gemini SDK: `@google/generative-ai ^0.21.0` -- supports `responseModalities` for native image gen on `gemini-2.0-flash-exp` / newer image models
- Verify Gemini API key has image generation access (may need to use `gemini-2.0-flash-exp` or `gemini-2.5-flash-image` model for image calls)
- No new dependencies needed if current SDK supports `responseModalities`; otherwise add `@google/genai`

---

## Implementation Steps

### Phase 1: Pokopia Vibe Wrapper (Prompts)

**Step 1.1: Update page-generation prompt**
- File: `prompts/page-generation.ts`
- Action: Rewrite STEP 1 (Design System) to hard-code the Pokopia vibe:
  - Primary palette: soft pastels (lavender, mint, peach, sky blue, butter yellow)
  - Background: warm cream/off-white with subtle gradient washes
  - Border radius: everything rounded-2xl or rounded-3xl (pill shapes, blob shapes)
  - Shadows: colored shadows (e.g. `shadow-purple-200/50`) for depth
  - Typography: rounded-feeling (system-ui or Inter with heavier weights for warmth)
  - Micro-details: subtle border strokes, sticker-like card treatments (thick white outline / slight rotation), emoji-style inline SVG icons
  - Tone: cozy, friendly, playful -- no corporate stiffness
  - Add a dedicated "POKOPIA VIBE" section after the design system step
- Rationale: Centralizes the vibe in the generation prompt so all initial pages come out on-brand

**Step 1.2: Update edit-page prompt**
- File: `app/api/ai/edit-page/route.ts`
- Action: Add a `POKOPIA VIBE` section to `EDIT_SYSTEM_PROMPT` matching Step 1.1 rules
  - Insert between DESIGN STANDARDS and HTML QUALITY BAR
  - Instruct the AI to maintain Pokopia aesthetics even when user requests structural changes
  - Override the current quality bar colors/shadows with Pokopia equivalents
- Rationale: Ensures edits don't drift away from the established vibe

**Step 1.3: Update design system field behavior**
- File: `prompts/page-generation.ts`
- Action: In the designSystem output description, prepend "Pokopia --" to signal the vibe (e.g. "Pokopia -- soft pastels, rounded kawaii UI, cream backgrounds, playful icons")
- Rationale: The designSystem string is passed to edit-page as context, so it carries the vibe forward

### Phase 2: Image Generation API

**Step 2.1: Create image generation route**
- File: `app/api/ai/generate-image/route.ts` (NEW)
- Action: Create a POST endpoint that:
  - Accepts `{ prompt: string, aspectRatio?: string }` (default aspect ratio "16:9")
  - Uses Gemini model with `responseModalities: ['Image']` (or Imagen model if SDK supports `generateImages`)
  - Returns `{ imageDataUrl: string }` (base64 data URL, e.g. `data:image/png;base64,...`)
  - Gated by auth middleware (same as other AI routes)
  - Max image size: compress to JPEG 0.8 if > 500KB
- Rationale: Standalone image endpoint is reusable from both generation and editing flows
- Fallback: If native Gemini image gen isn't available with current SDK, use `@google/genai` new SDK or Imagen API

**Step 2.2: Verify/upgrade SDK if needed**
- File: `package.json`
- Action: Check if `@google/generative-ai ^0.21.0` supports `responseModalities: ['Image']`. If not:
  - Option A: Add `@google/genai` (newer Google GenAI SDK) alongside existing
  - Option B: Use Imagen REST API directly via fetch
- Rationale: Need to confirm SDK capability before building the route

### Phase 3: Wire Image Generation into Page Generator

**Step 3.1: Update page-generation prompt for image awareness**
- File: `prompts/page-generation.ts`
- Action: Add instruction to STEP 3:
  - "When a page needs an illustration, hero image, product screenshot, avatar, or decorative visual, include an `<img>` tag with: `src=\"/api/placeholder\"` and `data-generate=\"[detailed image description in Pokopia style]\"` and appropriate `alt` text, `width`, `height`, and Tailwind classes"
  - "Describe images vividly: style (kawaii illustration, soft watercolor, cute icon), subject, colors, mood"
  - "Use images for: hero visuals, feature illustrations, testimonial avatars, decorative elements, empty states"
- Rationale: Teaches the model to request images via a convention that post-processing can detect

**Step 3.2: Add post-processing to generate-pages route**
- File: `app/api/ai/generate-pages/route.ts`
- Action: After parsing Gemini's JSON response:
  1. For each page, scan `html` for `<img[^>]*data-generate="([^"]*)"` regex
  2. Collect all image prompts (deduplicate similar ones)
  3. Batch-generate images via internal call to `/api/ai/generate-image` (or direct SDK call to avoid HTTP overhead)
  4. Replace placeholder `src` with base64 data URLs in the HTML
  5. Return the enriched response
- Add a helper: `generateAndInjectImages(html: string): Promise<string>`
- Add concurrency limit (max 3 parallel image generations to avoid rate limits)
- Timeout: 10s per image, skip and leave placeholder if fails
- Rationale: Transparent to the client -- pages arrive with real images embedded

**Step 3.3: Add image generation to edit-page flow**
- File: `app/api/ai/edit-page/route.ts`
- Action: After streaming completes and HTML is extracted:
  - This is trickier because the response is streamed. Two options:
    - **Option A (simpler):** Client-side post-processing. After receiving the full HTML, the design-view component scans for `data-generate` attributes and calls `/api/ai/generate-image` for each, then updates the srcdoc.
    - **Option B:** Buffer the stream server-side, post-process, then stream. Adds latency.
  - **Recommend Option A** for better UX (page appears fast, images load in progressively)
- File: `components/views/design-view.tsx`
- Action: Add a `processGeneratedImages(html: string)` function:
  1. Parse HTML for `data-generate` img tags
  2. Show the page immediately with placeholder styling (pulsing gradient bg on img containers)
  3. Fire off parallel `/api/ai/generate-image` calls
  4. As each returns, update the iframe srcdoc by replacing the specific placeholder
  5. Limit to 4 concurrent requests
- Rationale: Progressive image loading gives the best perceived performance

### Phase 4: Polish

**Step 4.1: Add Pokopia placeholder styling**
- File: `components/views/design-view.tsx` (or inline in generated HTML)
- Action: For images pending generation, inject CSS:
  ```css
  img[data-generate] {
    background: linear-gradient(135deg, #f0e6ff, #ffe6f0, #e6fff0);
    background-size: 200% 200%;
    animation: pokopia-shimmer 2s ease infinite;
    border-radius: 1rem;
  }
  @keyframes pokopia-shimmer {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  ```
- Rationale: Pastel shimmer placeholder fits the Pokopia aesthetic while images load

**Step 4.2: Update edit-page prompt for image awareness**
- File: `app/api/ai/edit-page/route.ts`
- Action: Add to DESIGN STANDARDS:
  - "You may add `<img data-generate='...'>` tags for new visuals. Use the same convention as initial generation."
  - "Preserve existing `<img>` tags with base64 src -- do not regenerate images that already exist"
- Rationale: Allows the edit flow to add new images while keeping existing ones

---

## Testing Strategy

- [ ] Generate pages for a sample project -- verify Pokopia pastel palette, rounded elements, cozy feel
- [ ] Edit a generated page ("add a hero image") -- verify `data-generate` tag appears and image gets generated
- [ ] Check image generation route returns valid base64 data URLs
- [ ] Verify images inject correctly into iframe srcdoc (no CORS issues with data URLs)
- [ ] Test error case: image generation fails -- placeholder should remain, no crash
- [ ] Test concurrency: page with 5+ images should respect parallel limit
- [ ] Verify edit-page preserves existing images (no re-generation of already-embedded base64 images)

---

## Rollback Plan

- Revert prompt changes in `prompts/page-generation.ts` and `app/api/ai/edit-page/route.ts`
- Delete `app/api/ai/generate-image/route.ts`
- Revert post-processing in `generate-pages/route.ts` and `design-view.tsx`
- All changes are additive -- no existing functionality is removed

---

## Estimated Complexity

**Medium-High**
- Prompt changes (Phase 1): straightforward, low risk
- Image gen API (Phase 2): medium -- depends on SDK capability, may need SDK upgrade
- Wiring (Phase 3): highest complexity -- async image injection in both server (generation) and client (editing) flows
- Estimate: 4 phases, ~8-10 files touched

---

## Key Decisions to Confirm with User

1. **SDK choice**: Stick with `@google/generative-ai` if it supports image gen, or add `@google/genai`?
2. **Image model**: `gemini-2.0-flash-exp` (native) vs `imagen-4.0-generate-001` (dedicated)?
3. **Pokopia vibe permanence**: Is this a temporary default or should it become a selectable "theme" later?
4. **Image budget**: How many images per page is reasonable? (Suggest: 3-5 max to keep generation fast)
