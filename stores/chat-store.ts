import { create } from 'zustand'
import type { ChatMessage, ChatPhase, OnboardingAnswers, AIRefinementQuestion } from '@/types/chat'
import { generateId } from '@/lib/id'

interface ChatState {
  messages: ChatMessage[]
  phase: ChatPhase
  isLoading: boolean
  error: string | null
  onboardingAnswers: OnboardingAnswers | null
  refinementQuestions: AIRefinementQuestion[]
  refinementAnswers: Record<string, string>
  addMessage: (role: 'user' | 'assistant', content: string) => void
  setPhase: (phase: ChatPhase) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setOnboardingAnswers: (answers: OnboardingAnswers) => void
  setRefinementQuestions: (questions: AIRefinementQuestion[]) => void
  answerRefinementQuestion: (questionId: string, answer: string) => void
  clearRefinementState: () => void
  reset: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  phase: 'onboarding',
  isLoading: false,
  error: null,
  onboardingAnswers: null,
  refinementQuestions: [],
  refinementAnswers: {},
  addMessage: (role, content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { id: generateId(), role, content, timestamp: Date.now() },
      ],
    })),
  setPhase: (phase) => set({ phase }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setOnboardingAnswers: (answers) => set({ onboardingAnswers: answers }),
  setRefinementQuestions: (questions) => set({ refinementQuestions: questions }),
  answerRefinementQuestion: (questionId, answer) =>
    set((state) => ({
      refinementAnswers: { ...state.refinementAnswers, [questionId]: answer },
    })),
  clearRefinementState: () => set({ refinementQuestions: [], refinementAnswers: {} }),
  reset: () =>
    set({
      messages: [],
      phase: 'onboarding',
      isLoading: false,
      error: null,
      onboardingAnswers: null,
      refinementQuestions: [],
      refinementAnswers: {},
    }),
}))
