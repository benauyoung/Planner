import { getGeminiClient } from '@/services/gemini'
import { buildArchitectureSystemMessage } from '@/prompts/architecture-system'

export async function POST(req: Request) {
  try {
    const {
      message,
      isInitial,
      context,
      chatHistory,
    } = await req.json()

    const systemPrompt = buildArchitectureSystemMessage(!!isInitial)

    const historyText = chatHistory?.length
      ? `\nCONVERSATION SO FAR:\n${chatHistory.map((m: { role: string; content: string }) => `${m.role === 'user' ? 'User' : 'Architect'}: ${m.content}`).join('\n\n')}`
      : ''

    const userMessage = `${context}${historyText}\n\nUser: ${message}`

    const client = getGeminiClient()
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
    })

    const result = await model.generateContentStream(userMessage)

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) controller.enqueue(encoder.encode(text))
          }
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Architecture chat error:', error)
    return new Response(JSON.stringify({ error: 'Failed to process architecture chat' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
