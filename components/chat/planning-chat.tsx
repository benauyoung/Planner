'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Save, CheckCircle, SkipForward, Sparkles, MessageSquare } from 'lucide-react'
import { useAIChat } from '@/hooks/use-ai-chat'
import { useProject } from '@/hooks/use-project'
import { useProjectStore } from '@/stores/project-store'
import { useChatStore } from '@/stores/chat-store'
import { ChatMessage } from './chat-message'
import { ChatInput } from './chat-input'
import { TypingIndicator } from './typing-indicator'
import { RefinementQuestionCards } from './refinement-question-card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const PHASES = [
  { key: 'refining', label: 'Refine' },
  { key: 'planning', label: 'Plan' },
  { key: 'done', label: 'Done' },
] as const

function PhaseIndicator({ currentPhase }: { currentPhase: string }) {
  const phaseIndex = PHASES.findIndex((p) => p.key === currentPhase)
  const activeIndex = phaseIndex === -1 ? 0 : phaseIndex

  return (
    <div className="flex items-center gap-1.5">
      {PHASES.map((phase, idx) => {
        const isActive = idx === activeIndex
        const isComplete = idx < activeIndex
        return (
          <div key={phase.key} className="flex items-center gap-1.5">
            {idx > 0 && (
              <div
                className={cn(
                  'w-4 h-px transition-colors duration-300',
                  isComplete ? 'bg-violet-500' : 'bg-border'
                )}
              />
            )}
            <div className="flex items-center gap-1">
              <div
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  isActive && 'bg-violet-500 ring-2 ring-violet-500/30 ring-offset-1 ring-offset-background',
                  isComplete && 'bg-violet-500',
                  !isActive && !isComplete && 'bg-border'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors duration-300',
                  isActive && 'text-violet-500',
                  isComplete && 'text-muted-foreground',
                  !isActive && !isComplete && 'text-muted-foreground/50'
                )}
              >
                {phase.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="text-center space-y-3"
      >
        <div className="relative mx-auto w-12 h-12">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 blur-lg opacity-30" />
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Let's build your plan</p>
          <p className="text-xs text-muted-foreground mt-1">
            Describe your project and AI will help structure it
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export function PlanningChat() {
  const router = useRouter()
  const {
    messages,
    phase,
    isLoading,
    error,
    sendMessage,
    initChat,
    submitRefinementAnswers,
    skipRefinement,
  } = useAIChat()
  const { saveProject } = useProject()
  const currentProject = useProjectStore((s) => s.currentProject)
  const scrollRef = useRef<HTMLDivElement>(null)
  const initRef = useRef(false)
  const chatPhase = useChatStore((s) => s.phase)
  const refinementQuestions = useChatStore((s) => s.refinementQuestions)

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
  }, [messages, isLoading, refinementQuestions])

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
      {/* Header */}
      <div className="relative border-b px-4 py-3">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center">
              <MessageSquare className="h-3.5 w-3.5 text-violet-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">New Project</h2>
              <PhaseIndicator currentPhase={chatPhase} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {chatPhase === 'refining' && (
              <Button
                onClick={skipRefinement}
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5 text-xs h-7"
                disabled={isLoading}
              >
                <SkipForward className="h-3 w-3" />
                Skip
              </Button>
            )}
            {phase === 'done' && currentProject && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Button
                  onClick={handleSave}
                  size="sm"
                  className="shrink-0 gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 text-xs h-7"
                >
                  <CheckCircle className="h-3 w-3" />
                  Save Project
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      {messages.length === 0 && !isLoading ? (
        <EmptyState />
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isLatest={idx === messages.length - 1}
            />
          ))}
          {chatPhase === 'refining' && refinementQuestions.length > 0 && !isLoading && (
            <RefinementQuestionCards
              questions={refinementQuestions}
              onSubmit={submitRefinementAnswers}
              isLoading={isLoading}
            />
          )}
          {isLoading && <TypingIndicator />}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-3"
            >
              {error}
            </motion.div>
          )}
        </div>
      )}

      <ChatInput
        onSend={sendMessage}
        disabled={isLoading}
        placeholder={
          chatPhase === 'refining'
            ? 'Type a message or answer the questions above...'
            : 'Describe your project idea...'
        }
      />
    </div>
  )
}
