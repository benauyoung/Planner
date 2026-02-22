import { NextResponse } from 'next/server'
import { getGeminiClient, appGenerationSchema } from '@/services/gemini'
import { APP_GENERATION_SYSTEM_PROMPT } from '@/prompts/app-generation'

export async function POST(req: Request) {
  try {
    const { context } = await req.json()

    if (!context || typeof context !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid context' },
        { status: 400 }
      )
    }

    const client = getGeminiClient()
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: APP_GENERATION_SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: appGenerationSchema,
      },
    })

    const result = await model.generateContent(context)
    const responseText = result.response.text()
    const parsed = JSON.parse(responseText)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('App generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate app' },
      { status: 500 }
    )
  }
}
