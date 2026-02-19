import { NextResponse } from 'next/server'
import { getGeminiClient, agentGenerationSchema } from '@/services/gemini'
import { AGENT_GENERATION_SYSTEM_PROMPT, buildAgentGenerationContext } from '@/prompts/agent-generation'

export async function POST(req: Request) {
  try {
    const { description, projectTitle } = await req.json()

    const client = getGeminiClient()
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: AGENT_GENERATION_SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: agentGenerationSchema,
      },
    })

    const prompt = buildAgentGenerationContext(description, projectTitle)
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    const parsed = JSON.parse(responseText)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Agent generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate agent' },
      { status: 500 }
    )
  }
}
