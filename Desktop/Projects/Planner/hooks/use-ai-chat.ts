'use client'

import { useCallback } from 'react'
import { useChatStore } from '@/stores/chat-store'
import { useProjectStore } from '@/stores/project-store'
import { useUIStore } from '@/stores/ui-store'
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
        // Build enriched message with node context if a node is selected
        let enrichedContent = content
        const selectedNodeId = useUIStore.getState().selectedNodeId
        if (selectedNodeId) {
          const project = useProjectStore.getState().currentProject
          const focusedNode = project?.nodes.find((n) => n.id === selectedNodeId)
          if (focusedNode) {
            enrichedContent = `[IMPORTANT CONTEXT: The user has selected the ${focusedNode.type} node "${focusedNode.title}" (id: ${focusedNode.id}) in the plan graph. They are asking about THIS SPECIFIC NODE. Tailor your entire response to be about this node and its children. If adding or updating nodes, focus on children/tasks under this node.]\n\n${content}`
          }
        }

        const allMessages = [
          ...useChatStore.getState().messages,
        ]

        // Replace the last user message content with the enriched version for the API call
        const apiMessages = allMessages.map((m, i) =>
          i === allMessages.length - 1 && m.role === 'user'
            ? { role: m.role, content: enrichedContent }
            : { role: m.role, content: m.content }
        )

        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
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
