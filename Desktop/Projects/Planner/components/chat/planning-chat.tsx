'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Save, CheckCircle } from 'lucide-react'
import { useAIChat } from '@/hooks/use-ai-chat'
import { useProject } from '@/hooks/use-project'
import { useProjectStore } from '@/stores/project-store'
import { useChatStore } from '@/stores/chat-store'
import { ChatMessage } from './chat-message'
import { ChatInput } from './chat-input'
import { TypingIndicator } from './typing-indicator'
import { Button } from '@/components/ui/button'

export function PlanningChat() {
  const router = useRouter()
  const {
    messages,
    phase,
    isLoading,
    error,
    sendMessage,
    initChat,
  } = useAIChat()
  const { saveProject } = useProject()
  const currentProject = useProjectStore((s) => s.currentProject)
  const scrollRef = useRef<HTMLDivElement>(null)
  const initRef = useRef(false)
  const chatPhase = useChatStore((s) => s.phase)

  useEffect(() => {
    if (!initRef.current && chatPhase !== 'onboarding') {
      initRef.current = true
      initChat()
    }
  }, [initChat, chatPhase])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleSave = async () => {
    if (!currentProject) return
    const activatedProject = {
      ...currentProject,
      phase: 'active' as const,
      updatedAt: Date.now(),
    }
    useProjectStore.getState().setCurrentProject(activatedProject)
    useProjectStore.getState().addProject(activatedProject)
    await saveProject(activatedProject)
    router.push(`/project/${activatedProject.id}`)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">New Project</h2>
            <p className="text-sm text-muted-foreground">
              Describe your idea and the AI will help you plan it out
            </p>
          </div>
          {phase === 'done' && currentProject && (
            <Button onClick={handleSave} size="sm" className="shrink-0 gap-1.5">
              <CheckCircle className="h-4 w-4" />
              Save
            </Button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && <TypingIndicator />}
        {error && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg p-3">
            {error}
          </div>
        )}
      </div>

      <ChatInput
        onSend={sendMessage}
        disabled={isLoading}
        placeholder="Describe your project idea..."
      />
    </div>
  )
}
