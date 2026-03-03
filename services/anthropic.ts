import Anthropic from '@anthropic-ai/sdk'

let client: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
    if (!client) {
        const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY
        if (!apiKey) throw new Error('NEXT_PUBLIC_ANTHROPIC_API_KEY is not set')
        client = new Anthropic({ apiKey })
    }
    return client
}

export const CLAUDE_MODEL = 'claude-opus-4-6-20260205'
