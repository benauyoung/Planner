import { NextResponse } from 'next/server'
import { getAnthropicClient, CLAUDE_MODEL } from '@/services/anthropic'
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

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const client = getAnthropicClient()

    // Convert messages to Anthropic format
    const anthropicMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
      content: m.content,
    }))

    // Anthropic requires first message to be from user
    const firstUserIndex = anthropicMessages.findIndex((m: { role: string }) => m.role === 'user')
    const validMessages = firstUserIndex >= 0 ? anthropicMessages.slice(firstUserIndex) : anthropicMessages

    const result = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system: PLANNING_SYSTEM_PROMPT + JSON_INSTRUCTION,
      messages: validMessages,
    })

    // Extract text from Claude's response
    const textBlock = result.content.find((block) => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from Claude')
    }

    // Clean up response — remove any markdown code fences if Claude adds them
    let responseText = textBlock.text.trim()
    if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    const parsed = JSON.parse(responseText)
    return NextResponse.json(parsed)
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    )
  }
}
