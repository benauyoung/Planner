import { NextResponse } from 'next/server'
import { getGeminiClient, backendGenerationSchema } from '@/services/gemini'
import { BACKEND_GENERATION_SYSTEM_PROMPT } from '@/prompts/backend-generation'

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

Analyze this project and generate the complete backend architecture. Identify all API endpoints, data models, services, middleware, database schemas, auth modules, and configuration needed. Generate TypeScript code for each module and map the relationships between them.
`

    const client = getGeminiClient()
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: BACKEND_GENERATION_SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: backendGenerationSchema,
      },
    })

    const result = await model.generateContent(context)
    const responseText = result.response.text()
    const parsed = JSON.parse(responseText)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Backend generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate backend architecture' },
      { status: 500 }
    )
  }
}
