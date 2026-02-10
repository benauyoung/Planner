import { NextResponse } from 'next/server'
import { getGeminiClient, prdGenerationSchema } from '@/services/gemini'
import { PRD_SYSTEM_PROMPT } from '@/prompts/prd-generation'

export async function POST(req: Request) {
  try {
    const { context } = await req.json()

    const client = getGeminiClient()
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: PRD_SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: prdGenerationSchema,
      },
    })

    const result = await model.generateContent(context)
    const responseText = result.response.text()
    const parsed = JSON.parse(responseText)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('PRD generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PRD' },
      { status: 500 }
    )
  }
}
