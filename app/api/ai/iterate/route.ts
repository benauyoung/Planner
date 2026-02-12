import { NextResponse } from 'next/server'
import { getGeminiClient, iterationSchema } from '@/services/gemini'
import { buildIterationPrompt, type IterationAction } from '@/prompts/iteration-system'

export async function POST(req: Request) {
  try {
    const { action, nodeContext, fullPlanSummary } = (await req.json()) as {
      action: IterationAction
      nodeContext: string
      fullPlanSummary?: string
    }

    const systemPrompt = buildIterationPrompt(action, nodeContext, fullPlanSummary)

    const client = getGeminiClient()
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: iterationSchema,
      },
    })

    const result = await model.generateContent(
      `Execute the ${action.replace('_', ' ')} action based on the provided context.`
    )
    const responseText = result.response.text()
    const parsed = JSON.parse(responseText)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('AI iterate error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI iteration response' },
      { status: 500 }
    )
  }
}
