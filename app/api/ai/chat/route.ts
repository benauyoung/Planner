import { NextResponse } from 'next/server'
import { isAnthropicConfigured, getAnthropicClient, CLAUDE_MODEL } from '@/services/anthropic'
import { getGeminiClient, progressiveChatSchema } from '@/services/gemini'
import { PLANNING_SYSTEM_PROMPT } from '@/prompts/planning-system'

const JSON_INSTRUCTION = `

CRITICAL: You MUST respond with ONLY valid JSON matching this exact schema. No markdown, no explanation, no code fences — just the raw JSON object:
{
  "message": "Your conversational response",
  "nodes": [
    {
      "id": "goal-1",
      "type": "goal",
      "title": "...",
      "description": "...",
      "parentId": null,
      "questions": [
        { "question": "A decision-oriented question", "options": ["Option 1", "Option 2", "Option 3"] }
      ]
    }
  ],
  "suggestedTitle": "Project Title or null",
  "done": false
}`

type ChatMessage = { role: string; content: string }

async function callClaude(messages: ChatMessage[]) {
  const client = getAnthropicClient()

  const anthropicMessages = messages.map((m) => ({
    role: (m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
    content: m.content,
  }))

  const firstUserIndex = anthropicMessages.findIndex((m) => m.role === 'user')
  const validMessages = firstUserIndex >= 0 ? anthropicMessages.slice(firstUserIndex) : anthropicMessages

  const result = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: PLANNING_SYSTEM_PROMPT + JSON_INSTRUCTION,
    messages: validMessages,
  })

  const textBlock = result.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') throw new Error('No text response from Claude')

  let text = textBlock.text.trim()
  if (text.startsWith('```')) text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  return JSON.parse(text)
}

async function callGemini(messages: ChatMessage[]) {
  const client = getGeminiClient()
  const model = client.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: PLANNING_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: progressiveChatSchema,
    },
  })

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const firstUserIndex = history.findIndex((m: { role: string }) => m.role === 'user')
  const validHistory = firstUserIndex >= 0 ? history.slice(firstUserIndex) : []

  const chat = model.startChat({ history: validHistory })
  const lastMessage = messages[messages.length - 1]
  const result = await chat.sendMessage(lastMessage.content)
  return JSON.parse(result.response.text())
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Try Claude first, fall back to Gemini
    if (isAnthropicConfigured()) {
      try {
        const parsed = await callClaude(messages)
        return NextResponse.json(parsed)
      } catch (claudeError) {
        console.error('Claude chat failed, falling back to Gemini:', claudeError)
      }
    }

    // Gemini fallback
    const parsed = await callGemini(messages)
    return NextResponse.json(parsed)
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    )
  }
}
