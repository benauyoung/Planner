import { NextResponse } from 'next/server'
import { getGeminiClient, backendEditSchema } from '@/services/gemini'

const EDIT_SYSTEM_PROMPT = `You are a senior backend architect. You receive the current TypeScript code of a backend module and an instruction from the user on what to change. Return the COMPLETE updated code with the requested changes applied. Maintain the existing patterns and style. Use TypeScript with proper types, error handling, and modern async/await patterns.`

export async function POST(req: Request) {
  try {
    const { currentCode, instruction, moduleTitle, moduleType } = await req.json()

    const context = `
MODULE: ${moduleTitle} (${moduleType})

CURRENT CODE:
${currentCode}

USER INSTRUCTION: ${instruction}

Apply the requested changes to the code. Return the complete updated code.
`

    const client = getGeminiClient()
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: EDIT_SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: backendEditSchema,
      },
    })

    const result = await model.generateContent(context)
    const responseText = result.response.text()
    const parsed = JSON.parse(responseText)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Backend edit error:', error)
    return NextResponse.json(
      { error: 'Failed to edit backend module' },
      { status: 500 }
    )
  }
}
