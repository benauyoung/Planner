import { NextResponse } from 'next/server'
import { getGeminiClient, pageGenerationSchema } from '@/services/gemini'
import { PAGE_GENERATION_SYSTEM_PROMPT } from '@/prompts/page-generation'

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

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Page generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate pages' },
      { status: 500 }
    )
  }
}
