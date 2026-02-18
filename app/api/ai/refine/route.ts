import { NextResponse } from 'next/server'
import { getGeminiClient, refinementChatSchema } from '@/services/gemini'
import { REFINEMENT_SYSTEM_PROMPT } from '@/prompts/refinement-system'

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const client = getGeminiClient()
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: REFINEMENT_SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: refinementChatSchema,
      },
    })

    const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    // Gemini requires history to start with a 'user' role
    const firstUserIndex = history.findIndex((m: { role: string }) => m.role === 'user')
    const validHistory = firstUserIndex >= 0 ? history.slice(firstUserIndex) : []

    const chat = model.startChat({
      history: validHistory,
    })

    const lastMessage = messages[messages.length - 1]
    const result = await chat.sendMessage(lastMessage.content)
    const responseText = result.response.text()
    const parsed = JSON.parse(responseText)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('AI refinement error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI refinement response' },
      { status: 500 }
    )
  }
}
