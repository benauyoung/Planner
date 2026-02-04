'use client'

import { useCallback } from 'react'
import { useChatStore } from '@/stores/chat-store'
import { useProjectStore } from '@/stores/project-store'
import type { AIProgressiveResponse } from '@/types/chat'

export function useAIChat() {
  const {
    messages,
    phase,
    isLoading,
    error,
    addMessage,
    setPhase,
    setLoading,
    setError,
  } = useChatStore()

  const { mergeNodes } = useProjectStore()

  const handleResponse = useCallback(
    (data: AIProgressiveResponse) => {
      addMessage('assistant', data.message)

      if (data.nodes && data.nodes.length > 0) {
        mergeNodes(data.nodes, data.suggestedTitle)
        if (phase === 'greeting') {
          setPhase('planning')
        }
      }

      if (data.done) {
        setPhase('done')
      } else if (phase === 'greeting' && data.nodes?.length === 0) {
        setPhase('planning')
      }
    },
    [addMessage, mergeNodes, setPhase, phase]
  )

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      addMessage('user', content)
      setLoading(true)
      setError(null)

      try {
        const allMessages = [
          ...useChatStore.getState().messages,
        ]

        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: allMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        })

        if (!res.ok) throw new Error('Failed to get AI response')

        const data: AIProgressiveResponse = await res.json()
        handleResponse(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    },
    [isLoading, addMessage, setLoading, setError, handleResponse]
  )

  const initChat = useCallback(async () => {
    if (messages.length > 0) return

    setLoading(true)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hi, I want to plan a new project.' }],
        }),
      })

      if (!res.ok) throw new Error('Failed to get AI response')

      const data: AIProgressiveResponse = await res.json()
      addMessage('assistant', data.message)

      if (data.nodes && data.nodes.length > 0) {
        mergeNodes(data.nodes, data.suggestedTitle)
      }

      setPhase('planning')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start chat')
    } finally {
      setLoading(false)
    }
  }, [messages.length, addMessage, mergeNodes, setPhase, setLoading, setError])

  return {
    messages,
    phase,
    isLoading,
    error,
    sendMessage,
    initChat,
  }
}
