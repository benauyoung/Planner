import { NextResponse } from 'next/server'
import { getGeminiClient, promptGenerationSchema } from '@/services/gemini'
import { PROMPT_SYSTEM_PROMPT } from '@/prompts/prompt-generation'

export async function POST(req: Request) {
  try {
    const { context } = await req.json()

    const client = getGeminiClient()
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: PROMPT_SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: promptGenerationSchema,
      },
    })

    const result = await model.generateContent(context)
    const responseText = result.response.text()
    const parsed = JSON.parse(responseText)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Prompt generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate prompt' },
      { status: 500 }
    )
  }
}
