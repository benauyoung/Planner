'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useChatStore } from '@/stores/chat-store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { AIRefinementQuestion, RefinementCategory } from '@/types/chat'

const CATEGORY_STYLES: Record<RefinementCategory, { bg: string; text: string; label: string }> = {
  scope: { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'Scope' },
  technical: { bg: 'bg-purple-500/10', text: 'text-purple-500', label: 'Technical' },
  priority: { bg: 'bg-amber-500/10', text: 'text-amber-500', label: 'Priority' },
  audience: { bg: 'bg-green-500/10', text: 'text-green-500', label: 'Audience' },
  timeline: { bg: 'bg-rose-500/10', text: 'text-rose-500', label: 'Timeline' },
}

function QuestionCard({ question }: { question: AIRefinementQuestion }) {
  const refinementAnswers = useChatStore((s) => s.refinementAnswers)
  const answerRefinementQuestion = useChatStore((s) => s.answerRefinementQuestion)
  const selectedAnswer = refinementAnswers[question.id]
  const style = CATEGORY_STYLES[question.category]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border bg-card p-3 space-y-2.5"
    >
      <div className="flex items-center gap-2">
        <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', style.bg, style.text)}>
          {style.label}
        </span>
        <p className="text-xs font-medium leading-snug flex-1">{question.question}</p>
      </div>
      <div className="space-y-1">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => answerRefinementQuestion(question.id, option)}
            className={cn(
              'w-full text-left text-xs px-2.5 py-1.5 rounded-md border transition-colors',
              selectedAnswer === option
                ? 'border-primary bg-primary/10 text-foreground font-medium'
                : 'border-transparent bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            <span className="inline-flex items-center gap-2">
              <span className={cn(
                'w-3 h-3 rounded-full border-2 shrink-0 flex items-center justify-center',
                selectedAnswer === option
                  ? 'border-primary'
                  : 'border-muted-foreground/40'
              )}>
                {selectedAnswer === option && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </span>
              {option}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}

interface RefinementQuestionCardsProps {
  questions: AIRefinementQuestion[]
  onSubmit: () => void
  isLoading: boolean
}

export function RefinementQuestionCards({ questions, onSubmit, isLoading }: RefinementQuestionCardsProps) {
  const refinementAnswers = useChatStore((s) => s.refinementAnswers)
  const answeredCount = questions.filter((q) => refinementAnswers[q.id]).length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-2"
    >
      {questions.map((q, idx) => (
        <motion.div
          key={q.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.08 }}
        >
          <QuestionCard question={q} />
        </motion.div>
      ))}

      {answeredCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            size="sm"
            className="w-full mt-1 h-8 gap-1.5"
            onClick={onSubmit}
            disabled={isLoading}
          >
            Continue
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
