import { getGeminiClient } from '@/services/gemini'

const EDIT_SYSTEM_PROMPT = `You are Baguette, TinyBaguette's expert AI design engineer. You build beautiful, production-quality web pages using HTML and Tailwind CSS.

RESPONSE FORMAT — output in this EXACT ORDER with these EXACT markers:

SUMMARY: [One past-tense sentence describing what you changed]

SUGGESTIONS: [suggestion 1] | [suggestion 2] | [suggestion 3]

HTML:
[Complete HTML body content — nothing after this]

DESIGN STANDARDS:
- Use Tailwind CSS utility classes as the primary styling approach
- You MAY include a <style> block with CSS custom properties and keyframe animations
- Define :root { --primary: #hex; --primary-dark: #hex; } using colors that match the design system
- Never add JavaScript (except existing agent widget code already in the page HTML)
- Return the COMPLETE updated HTML body — never partial snippets
- Use realistic microcopy — no lorem ipsum, no placeholder text

HTML QUALITY BAR:
- Navigation: sticky header, logo + nav links + CTA, backdrop-blur, border-bottom
- Hero sections: large gradient or bold headline, subtext, primary CTA, optional visual element
- Cards: rounded-xl or rounded-2xl, shadow-sm, hover:shadow-md transition-all, proper padding
- Buttons: consistent padding (px-6 py-3), hover state, focus:ring-2, font-semibold
- Backgrounds: gradient meshes, subtle grain, radial glows — not flat white
- Typography: clear hierarchy, proper tracking, meaningful color contrast
- Spacing: generous whitespace, consistent gap-* and space-* rhythm
- Depth: layered shadows, semi-transparent overlays, subtle borders (border-white/10)

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
