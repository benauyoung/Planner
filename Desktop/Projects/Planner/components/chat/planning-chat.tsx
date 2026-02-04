'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Save } from 'lucide-react'
import { useAIChat } from '@/hooks/use-ai-chat'
import { useProject } from '@/hooks/use-project'
import { useProjectStore } from '@/stores/project-store'
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

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true
      initChat()
    }
  }, [initChat])

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
        <h2 className="font-semibold">New Project</h2>
        <p className="text-sm text-muted-foreground">
          Describe your idea and the AI will help you plan it out
        </p>
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

      {phase === 'done' && currentProject && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-2 p-4 rounded-lg border-2 border-primary/30 bg-primary/5"
        >
          <div className="flex items-center gap-3">
            <Save className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Your plan is ready!</p>
              <p className="text-xs text-muted-foreground">
                Save your project to start working on it, or keep chatting to refine the plan.
              </p>
            </div>
            <Button onClick={handleSave} size="sm">
              Save Project
            </Button>
          </div>
        </motion.div>
      )}

      <ChatInput
        onSend={sendMessage}
        disabled={isLoading}
        placeholder="Describe your project idea..."
      />
    </div>
  )
}
