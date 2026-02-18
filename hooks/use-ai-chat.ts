'use client'

import { useCallback } from 'react'
import { useChatStore } from '@/stores/chat-store'
import { useProjectStore } from '@/stores/project-store'
import { useUIStore } from '@/stores/ui-store'
import type { AIProgressiveResponse, AIRefinementResponse } from '@/types/chat'
import { formatOnboardingMessage } from '@/lib/onboarding-message'

export function useAIChat() {
  const {
    messages,
    phase,
    isLoading,
    error,
    refinementQuestions,
    refinementAnswers,
    addMessage,
    setPhase,
    setLoading,
    setError,
    setRefinementQuestions,
    clearRefinementState,
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

  const transitionToPlanning = useCallback(
    async () => {
      // Send the full conversation (with all Q&A rounds) to the planning endpoint
      clearRefinementState()
      setPhase('planning')
      setLoading(true)
      setError(null)

      try {
        const allMessages = useChatStore.getState().messages
        const apiMessages = allMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }))

        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              ...apiMessages,
              { role: 'user', content: 'All my answers are above. Now build the full project plan based on everything discussed.' },
            ],
          }),
        })

        if (!res.ok) throw new Error('Failed to get AI response')

        const data: AIProgressiveResponse = await res.json()
        addMessage('assistant', data.message)

        if (data.nodes && data.nodes.length > 0) {
          mergeNodes(data.nodes, data.suggestedTitle)
        }

        if (data.done) {
          setPhase('done')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start planning')
      } finally {
        setLoading(false)
      }
    },
    [addMessage, mergeNodes, setPhase, setLoading, setError, clearRefinementState]
  )

  const handleRefinementResponse = useCallback(
    (data: AIRefinementResponse) => {
      addMessage('assistant', data.message)

      if (data.readyToBuild) {
        // AI says we have enough context — transition to planning
        transitionToPlanning()
      } else if (data.questions && data.questions.length > 0) {
        setRefinementQuestions(data.questions)
        setPhase('refining')
      }
    },
    [addMessage, setPhase, setRefinementQuestions, transitionToPlanning]
  )

  const submitRefinementAnswers = useCallback(
    async () => {
      const questions = useChatStore.getState().refinementQuestions
      const answers = useChatStore.getState().refinementAnswers

      // Format selected answers as a user message
      const answeredLines = questions
        .filter((q) => answers[q.id])
        .map((q) => `${q.question}: ${answers[q.id]}`)

      if (answeredLines.length === 0) return

      const answerMessage = answeredLines.join('\n')
      addMessage('user', answerMessage)
      clearRefinementState()
      setLoading(true)
      setError(null)

      try {
        const allMessages = useChatStore.getState().messages
        const apiMessages = allMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }))

        const res = await fetch('/api/ai/refine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages }),
        })

        if (!res.ok) throw new Error('Failed to get AI response')

        const data: AIRefinementResponse = await res.json()
        handleRefinementResponse(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    },
    [addMessage, setLoading, setError, clearRefinementState, handleRefinementResponse]
  )

  const skipRefinement = useCallback(
    async () => {
      addMessage('user', 'Just build the plan with what you have.')
      clearRefinementState()
      transitionToPlanning()
    },
    [addMessage, clearRefinementState, transitionToPlanning]
  )

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      addMessage('user', content)
      setLoading(true)
      setError(null)

      try {
        const currentPhase = useChatStore.getState().phase

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

        // Route to correct endpoint based on current phase
        if (currentPhase === 'refining') {
          const res = await fetch('/api/ai/refine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: apiMessages }),
          })

          if (!res.ok) throw new Error('Failed to get AI response')

          const data: AIRefinementResponse = await res.json()
          handleRefinementResponse(data)
        } else {
          const res = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: apiMessages }),
          })

          if (!res.ok) throw new Error('Failed to get AI response')

          const data: AIProgressiveResponse = await res.json()
          handleResponse(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    },
    [isLoading, addMessage, setLoading, setError, handleResponse, handleRefinementResponse]
  )

  const initChat = useCallback(async () => {
    if (messages.length > 0) return

    const onboardingAnswers = useChatStore.getState().onboardingAnswers
    const initialMessage = onboardingAnswers
      ? formatOnboardingMessage(onboardingAnswers)
      : 'Hi, I want to plan a new project.'

    if (onboardingAnswers) {
      addMessage('user', initialMessage)
    }

    setLoading(true)
    try {
      // Route initial message to refinement endpoint
      const res = await fetch('/api/ai/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: initialMessage }],
        }),
      })

      if (!res.ok) throw new Error('Failed to get AI response')

      const data: AIRefinementResponse = await res.json()

      if (data.readyToBuild) {
        // Very detailed prompt — skip refinement, go straight to planning
        addMessage('assistant', data.message)
        clearRefinementState()
        setPhase('planning')

        // Now send to planning endpoint with the full conversation
        const allMessages = useChatStore.getState().messages
        const apiMessages = allMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }))

        const planRes = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              ...apiMessages,
              { role: 'user', content: 'Build the full project plan based on the context above.' },
            ],
          }),
        })

        if (!planRes.ok) throw new Error('Failed to get planning response')

        const planData: AIProgressiveResponse = await planRes.json()
        addMessage('assistant', planData.message)

        if (planData.nodes && planData.nodes.length > 0) {
          mergeNodes(planData.nodes, planData.suggestedTitle)
        }

        if (planData.done) {
          setPhase('done')
        }
      } else {
        // Needs refinement — show question cards
        addMessage('assistant', data.message)
        if (data.questions && data.questions.length > 0) {
          setRefinementQuestions(data.questions)
        }
        setPhase('refining')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start chat')
    } finally {
      setLoading(false)
    }
  }, [messages.length, addMessage, mergeNodes, setPhase, setLoading, setError, setRefinementQuestions, clearRefinementState])

  return {
    messages,
    phase,
    isLoading,
    error,
    refinementQuestions,
    refinementAnswers,
    sendMessage,
    initChat,
    submitRefinementAnswers,
    skipRefinement,
  }
}
