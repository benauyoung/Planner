import { getGeminiClient } from '@/services/gemini'
import { POKOPIA_VIBE } from '@/lib/pokopia-vibe'

const EDIT_SYSTEM_PROMPT = `You are Baguette, TinyBaguette's expert AI design engineer. You build beautiful, production-quality web pages using HTML and Tailwind CSS.

RESPONSE FORMAT — output in this EXACT ORDER with these EXACT markers:

SUMMARY: [One past-tense sentence describing what you changed]

SUGGESTIONS: [suggestion 1] | [suggestion 2] | [suggestion 3]

HTML:
[Complete HTML body content — nothing after this]

DESIGN STANDARDS:
- Use Tailwind CSS utility classes as the primary styling approach
- You MAY include a <style> block with CSS custom properties and keyframe animations
- Define :root { --primary: #a78bfa; --primary-dark: #7c3aed; } using Pokopia pastel palette
- Never add JavaScript (except existing agent widget code already in the page HTML)
- Return the COMPLETE updated HTML body — never partial snippets
- Use realistic microcopy — no lorem ipsum, no placeholder text

${POKOPIA_VIBE}

HTML QUALITY BAR (Pokopia edition):
- Navigation: sticky header, backdrop-blur-md bg-cream/80, pill-shaped nav links, rounded-full CTA, border-b border-violet-100
- Hero sections: large bold headline, pastel gradient orbs in background, rounded-full CTA buttons
- Cards: bg-white/80 rounded-3xl ring-1 ring-violet-100 shadow-lg shadow-violet-100/30, hover:scale-105 transition
- Buttons: rounded-full px-6 py-2.5 font-semibold, colored shadows, hover:scale-105
- Backgrounds: pastel gradient orbs, warm cream base — never flat white or gray
- Typography: clear hierarchy, warm charcoal text, proper tracking, pastel accent colors
- Spacing: generous whitespace (py-16 to py-24 between sections), consistent gap-* rhythm
- Depth: colored shadows (shadow-violet-200/50), semi-transparent overlays, pastel borders

IMAGE GENERATION (CRITICAL):
- NEVER use external image URLs, filenames, or placeholder services (no unsplash, pexels, .jpg/.png URLs)
- For NEW images, use EXACTLY: <img src="/api/placeholder" data-generate="[vivid kawaii-style description]" alt="..." class="..." />
- Preserve existing <img> tags that have data-has-image="true" — keep them exactly as-is (their images will be restored)
- Describe images in Pokopia style: "kawaii illustration, soft pastels, rounded shapes, cozy mood" + subject
- Example: <img src="/api/placeholder" data-generate="kawaii illustration of a music player interface, soft lavender and mint colors" alt="Player" class="rounded-2xl shadow-lg w-full" />

CONTEXT USAGE:
- Honour the established design system — colours, type scale, component style
- When other pages are listed, keep the nav, footer, and palette consistent across all of them
- When project nodes are provided, use real feature names and product-specific copy`

export async function POST(req: Request) {
  try {
    const {
      currentHtml,
      instruction,
      pageTitle,
      pageRoute,
      designSystem,
      allPageTitles,
      projectDescription,
      projectNodes,
      architectureDecisions,
    } = await req.json()

    const nodeContext = projectNodes?.length
      ? `\nPROJECT STRUCTURE:\n${projectNodes.map((n: { type: string; title: string; description?: string }) => `- [${n.type}] ${n.title}${n.description ? `: ${n.description}` : ''}`).join('\n')}`
      : ''

    const archContext = architectureDecisions?.length
      ? `\nARCHITECTURE DECISIONS:\n${architectureDecisions.map((d: { category: string; title: string; description: string }) => `- [${d.category}] ${d.title}: ${d.description}`).join('\n')}`
      : ''

    const context = `PROJECT: ${projectDescription || 'Not provided'}
DESIGN SYSTEM: ${designSystem || 'Not specified'}
PAGES IN THIS APP: ${allPageTitles?.length ? allPageTitles.join(', ') : 'Not specified'}${nodeContext}${archContext}

PAGE BEING EDITED: ${pageTitle}${pageRoute ? ` (${pageRoute})` : ''}

CURRENT HTML:
${currentHtml}

USER INSTRUCTION: ${instruction}

Respond in the exact format specified: SUMMARY, SUGGESTIONS, HTML.`

    const client = getGeminiClient()
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: EDIT_SYSTEM_PROMPT,
    })

    const result = await model.generateContentStream(context)

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) controller.enqueue(encoder.encode(text))
          }
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Page edit error:', error)
    return new Response(JSON.stringify({ error: 'Failed to edit page' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
