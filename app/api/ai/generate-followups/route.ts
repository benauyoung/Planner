import { NextResponse } from 'next/server'
import { getGeminiClient, followUpGenerationSchema } from '@/services/gemini'
import { FOLLOW_UP_GENERATION_PROMPT } from '@/prompts/follow-up-generation'

export async function POST(req: Request) {
  try {
    const { context, previousQA } = await req.json()

    const qaText = previousQA
      .map((qa: { id: string; question: string; answer: string; category?: string }) =>
        `[id: ${qa.id}]${qa.category ? ` [${qa.category}]` : ''}\nQ: ${qa.question}\nA: ${qa.answer}`
      )
      .join('\n\n')

    const fullPrompt = `${context}\n\n---\nPREVIOUS QUESTIONS AND ANSWERS:\n${qaText}`

    const client = getGeminiClient()
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: FOLLOW_UP_GENERATION_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: followUpGenerationSchema,
      },
    })

    const result = await model.generateContent(fullPrompt)
    const responseText = result.response.text()
    const parsed = JSON.parse(responseText)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Follow-up generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate follow-up questions' },
      { status: 500 }
    )
  }
}
