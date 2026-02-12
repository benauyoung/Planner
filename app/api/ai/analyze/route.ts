import { NextResponse } from 'next/server'
import { getGeminiClient } from '@/services/gemini'
import { suggestionSchema } from '@/services/gemini'
import { SUGGESTION_SYSTEM_PROMPT, buildAnalysisContext } from '@/prompts/suggestion-system'

export async function POST(req: Request) {
  try {
    const { projectSummary } = await req.json()

    const client = getGeminiClient()
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SUGGESTION_SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: suggestionSchema,
      },
    })

    const prompt = buildAnalysisContext(projectSummary)
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    const parsed = JSON.parse(responseText)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('AI analyze error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze project' },
      { status: 500 }
    )
  }
}
