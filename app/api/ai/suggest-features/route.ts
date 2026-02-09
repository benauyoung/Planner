import { NextResponse } from 'next/server'
import { getGeminiClient } from '@/services/gemini'
import { featureSuggestionsSchema } from '@/lib/feature-suggestions'

const SYSTEM_PROMPT = `You are a product planning assistant. Given a project description and type, suggest 8-12 specific features that would be essential or highly valuable for this project. Each feature should be concise (2-5 words) and actionable. Focus on features specific to this project idea, not generic ones like "responsive design" or "error handling". Order them from most critical to nice-to-have.`

export async function POST(req: Request) {
  try {
    const { description, projectType } = await req.json()

    const client = getGeminiClient()
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: featureSuggestionsSchema,
      },
    })

    const result = await model.generateContent(
      `Project description: ${description}\nProject type: ${projectType}\n\nSuggest 8-12 specific features for this project.`
    )
    const responseText = result.response.text()
    const parsed = JSON.parse(responseText)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Feature suggestion error:', error)
    return NextResponse.json(
      { error: 'Failed to get feature suggestions' },
      { status: 500 }
    )
  }
}
