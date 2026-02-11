import { NextResponse } from 'next/server'
import { getGeminiClient, questionGenerationSchema } from '@/services/gemini'
import { QUESTION_GENERATION_PROMPT } from '@/prompts/question-generation'

export async function POST(req: Request) {
  try {
    const { context } = await req.json()

    const client = getGeminiClient()
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: QUESTION_GENERATION_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: questionGenerationSchema,
      },
    })

    const result = await model.generateContent(context)
    const responseText = result.response.text()
    const parsed = JSON.parse(responseText)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Question generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    )
  }
}
