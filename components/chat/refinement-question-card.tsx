'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { useChatStore } from '@/stores/chat-store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { AIRefinementQuestion, RefinementCategory } from '@/types/chat'

const CATEGORY_STYLES: Record<RefinementCategory, { bg: string; text: string; border: string; label: string }> = {
  scope: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', label: 'Scope' },
  technical: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20', label: 'Technical' },
  priority: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', label: 'Priority' },
  audience: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', label: 'Audience' },
  timeline: { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20', label: 'Timeline' },
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
      className="rounded-xl border bg-card/50 backdrop-blur-sm p-3.5 space-y-3"
    >
      <div className="flex items-start gap-2">
        <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium border', style.bg, style.text, style.border)}>
          {style.label}
        </span>
        <p className="text-xs font-medium leading-snug flex-1">{question.question}</p>
      </div>
      <div className="space-y-1.5">
        {question.options.map((option, idx) => {
          const isSelected = selectedAnswer === option
          return (
            <motion.button
              key={idx}
              onClick={() => answerRefinementQuestion(question.id, option)}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'w-full text-left text-xs px-3 py-2 rounded-lg border transition-all duration-200',
                isSelected
                  ? 'border-violet-500/50 bg-violet-500/10 text-foreground font-medium shadow-sm'
                  : 'border-transparent bg-muted/40 hover:bg-muted/70 text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="inline-flex items-center gap-2.5">
                <span className={cn(
                  'w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-200',
                  isSelected
                    ? 'border-violet-500 bg-violet-500'
                    : 'border-muted-foreground/30'
                )}>
                  {isSelected && (
                    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                  )}
                </span>
                {option}
              </span>
            </motion.button>
          )
        })}
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
  const totalCount = questions.length
  const progress = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-2.5"
    >
      {/* Progress bar */}
      {answeredCount > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="px-1"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">
              {answeredCount} of {totalCount} answered
            </span>
          </div>
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      )}

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
            className="w-full mt-1 h-9 gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 rounded-xl"
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
