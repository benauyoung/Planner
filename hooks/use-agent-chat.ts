'use client'

import { useState, useCallback } from 'react'
import type { Agent } from '@/types/agent'

export interface AgentChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  actions?: { type: string; label: string; data?: string }[]
}

export function useAgentChat(agent: Agent | null) {
  const [messages, setMessages] = useState<AgentChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading || !agent) return

    const userMsg: AgentChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)
    setError(null)

    try {
      const allMessages = [...messages, userMsg]
      const apiMessages = allMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch(`/api/agent/${agent.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          systemPrompt: agent.systemPrompt,
          knowledge: agent.knowledge,
          rules: agent.rules.map((r) => r.rule),
        }),
      })

      if (!res.ok) throw new Error('Failed to get agent response')

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      const assistantMsg: AgentChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        timestamp: Date.now(),
        actions: data.actions,
      }

      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }, [agent, messages, isLoading])

  const resetChat = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, isLoading, error, sendMessage, resetChat }
}
