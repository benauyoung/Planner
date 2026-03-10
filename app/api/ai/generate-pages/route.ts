import { NextResponse } from 'next/server'
import { getGeminiClient, pageGenerationSchema } from '@/services/gemini'
import { PAGE_GENERATION_SYSTEM_PROMPT } from '@/prompts/page-generation'
import { injectGeneratedImages, sanitizeImageSrcs } from '@/lib/inject-images'

export async function POST(req: Request) {
  try {
    const { projectTitle, projectDescription, nodes } = await req.json()

    const context = `
PROJECT: ${projectTitle}
DESCRIPTION: ${projectDescription}

PROJECT NODES:
${nodes.map((n: { id: string; type: string; title: string; description: string; parentId: string | null }) =>
  `- [${n.type}] ${n.title} (id: ${n.id}, parent: ${n.parentId || 'root'}): ${n.description}`
).join('\n')}

Analyze this project and generate full-fidelity HTML page previews for every user-facing page/screen. Infer a cohesive design system from the project context. Determine navigation flow between pages.
`

    const client = getGeminiClient()
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: PAGE_GENERATION_SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: pageGenerationSchema,
      },
    })

    const result = await model.generateContent(context)
    const responseText = result.response.text()
    const parsed = JSON.parse(responseText)

    // Post-process: sanitize external image URLs, then generate images
    if (parsed.pages?.length) {
      // First pass: convert any external image URLs to data-generate placeholders
      for (const page of parsed.pages as { html: string }[]) {
        page.html = sanitizeImageSrcs(page.html)
      }

      const origin = req.headers.get('origin') || req.headers.get('referer')?.replace(/\/$/, '') || ''

      const imagePromises = parsed.pages.map(async (page: { html: string }) => {
        try {
          page.html = await injectGeneratedImages(
            page.html,
            (url: string, opts?: RequestInit) => fetch(url, opts),
            origin || undefined,
          )
        } catch (err) {
          console.warn('Image injection failed for page, continuing without images:', err)
        }
      })

      await Promise.allSettled(imagePromises)
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Page generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate pages' },
      { status: 500 }
    )
  }
}
