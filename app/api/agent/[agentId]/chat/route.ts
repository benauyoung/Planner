import { NextResponse } from 'next/server'
import { getGeminiClient, agentChatSchema } from '@/services/gemini'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params
    const { messages, systemPrompt, knowledge, rules } = await req.json()

    if (!systemPrompt) {
      return NextResponse.json(
        { error: 'Agent configuration is required' },
        { status: 400 }
      )
    }

    // Build the full system prompt from agent config
    const knowledgeContext = knowledge && knowledge.length > 0
      ? `\n\nKNOWLEDGE BASE:\n${knowledge.map((k: { title: string; content: string }) => `- ${k.title}: ${k.content}`).join('\n')}`
      : ''

    const rulesContext = rules && rules.length > 0
      ? `\n\nBEHAVIOR RULES (you MUST follow these):\n${rules.map((r: string) => `- ${r}`).join('\n')}`
      : ''

    const fullSystemPrompt = `${systemPrompt}${knowledgeContext}${rulesContext}`

    const client = getGeminiClient()
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: fullSystemPrompt,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: agentChatSchema,
      },
    })

    const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const firstUserIndex = history.findIndex((m: { role: string }) => m.role === 'user')
    const validHistory = firstUserIndex >= 0 ? history.slice(firstUserIndex) : []

    const chat = model.startChat({ history: validHistory })
    const lastMessage = messages[messages.length - 1]
    const result = await chat.sendMessage(lastMessage.content)
    const responseText = result.response.text()
    const parsed = JSON.parse(responseText)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Agent chat error:', error)
    return NextResponse.json(
      { error: 'Failed to get agent response' },
      { status: 500 }
    )
  }
}
