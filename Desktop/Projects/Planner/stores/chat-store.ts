import { create } from 'zustand'
import type { ChatMessage, ChatPhase } from '@/types/chat'
import { generateId } from '@/lib/id'

interface ChatState {
  messages: ChatMessage[]
  phase: ChatPhase
  isLoading: boolean
  error: string | null
  addMessage: (role: 'user' | 'assistant', content: string) => void
  setPhase: (phase: ChatPhase) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  phase: 'greeting',
  isLoading: false,
  error: null,
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
  reset: () =>
    set({
      messages: [],
      phase: 'greeting',
      isLoading: false,
      error: null,
    }),
}))
