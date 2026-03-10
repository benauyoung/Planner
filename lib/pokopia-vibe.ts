/**
 * Pokopia Vibe — design style constants for page generation.
 *
 * Extracted into its own file so the vibe can be easily swapped out or removed.
 * To remove the Pokopia style, delete this file and remove the imports
 * in `prompts/page-generation.ts` and `app/api/ai/edit-page/route.ts`.
 */

export const POKOPIA_VIBE = `
POKOPIA VIBE (apply to ALL generated HTML):
You are designing in the "Pokopia" aesthetic — a cozy, kawaii-inspired visual style
that feels like a polished indie game UI. Every page should feel warm, inviting, and
slightly playful while remaining fully production-quality.

COLOR PALETTE:
- Primary: soft lavender (#a78bfa / violet-400) or sky blue (#7dd3fc / sky-300)
- Accents: mint (#6ee7b7 / emerald-300), peach (#fdba74 / orange-300), butter yellow (#fde68a / amber-200)
- Backgrounds: warm cream (#fefce8 / yellow-50) or soft rose-white (#fff1f2 / rose-50)
- Text: warm charcoal (#292524 / stone-800) for body, slightly lighter for secondary
- Borders: pastel-tinted (border-violet-200, border-sky-200) — never plain gray
- Shadows: colored shadows (shadow-violet-200/50, shadow-sky-200/40) — never neutral gray

SHAPE LANGUAGE:
- Border radius: rounded-2xl or rounded-3xl on cards/containers, rounded-full on buttons and badges
- Blob/organic shapes: use CSS border-radius blobs (e.g. border-radius: 60% 40% 50% 70% / 50% 60% 40% 60%) for decorative backgrounds
- Pill-shaped buttons and inputs (rounded-full, px-6 py-2.5)
- Sticker-style cards: thick white border (ring-4 ring-white), slight shadow, optional subtle rotation (transform rotate-1 or -rotate-1)

TYPOGRAPHY:
- Headings: font-bold or font-extrabold, slightly larger than standard (text-4xl to text-6xl for heroes)
- Body: text-base with relaxed leading (leading-relaxed)
- Labels and badges: uppercase tracking-wide text-xs font-semibold in pastel pill containers
- Use playful but readable — nothing overly decorative

COMPONENTS:
- Cards: bg-white/80 backdrop-blur-sm rounded-3xl ring-1 ring-violet-100 shadow-lg shadow-violet-100/30 p-6
- Buttons (primary): bg-violet-400 hover:bg-violet-500 text-white rounded-full px-6 py-2.5 font-semibold shadow-md shadow-violet-300/40 transition-all hover:scale-105
- Buttons (secondary): bg-white ring-1 ring-violet-200 text-violet-600 rounded-full px-6 py-2.5 hover:bg-violet-50
- Inputs: rounded-full border-violet-200 focus:ring-2 focus:ring-violet-300 px-4 py-2.5
- Nav: sticky backdrop-blur-md bg-cream/80 border-b border-violet-100
- Badges: inline-flex items-center px-3 py-1 rounded-full bg-[pastel] text-xs font-semibold

DECORATIVE TOUCHES:
- Subtle gradient orbs in the background (absolute positioned, blurred, pastel colored: bg-violet-200/30 blur-3xl)
- Soft grain texture overlay (optional: a semi-transparent noise SVG in a ::before)
- Floating accent dots or small star/sparkle inline SVGs near headings
- Gentle hover animations: hover:scale-105 transition-transform, hover:-translate-y-0.5
- Section dividers: wavy SVG paths or soft gradient fades — never hard lines

IMAGES:
- When a page needs a visual (hero illustration, feature graphic, avatar, product screenshot,
  decorative image, or empty-state art), include an <img> tag with:
  - src="/api/placeholder" (temporary — will be replaced by generated images)
  - data-generate="[vivid description: style, subject, colors, mood — in Pokopia kawaii aesthetic]"
  - Appropriate alt text, width, height, and Tailwind classes (rounded-2xl, shadow-lg, etc.)
- Aim for 2-4 images per page (hero visual + feature illustrations)
- Image descriptions should specify: "kawaii illustration style, soft pastel colors, rounded shapes,
  warm lighting, cozy mood" plus the specific subject
- For avatars: "cute minimalist avatar, pastel background, friendly expression, round frame"
- Do NOT use placeholder.com or any external image URLs

OVERALL FEEL:
- Think "Pokopia meets Notion" — cute but functional, playful but organized
- Generous whitespace (py-16 to py-24 between sections)
- Every element should feel touchable and friendly
- Avoid anything corporate, sharp, or aggressive
`.trim()

/**
 * Short Pokopia vibe summary for the designSystem field.
 * Prepended to the AI's design system description.
 */
export const POKOPIA_DESIGN_SYSTEM_PREFIX = 'Pokopia --'
