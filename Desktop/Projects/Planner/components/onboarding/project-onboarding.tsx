'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe,
  Smartphone,
  Server,
  Monitor,
  BarChart3,
  Shapes,
  User,
  Rocket,
  Briefcase,
  GraduationCap,
  GitBranch,
  Zap,
  Calendar,
  CalendarRange,
  CalendarClock,
  Infinity,
  Users,
  UsersRound,
  Building2,
  ShieldCheck,
  BookOpen,
  Heart,
  TrendingUp,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Pencil,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ONBOARDING_STEPS } from '@/lib/onboarding-config'
import type { OnboardingAnswers } from '@/types/chat'

const ICON_MAP: Record<string, LucideIcon> = {
  Globe, Smartphone, Server, Monitor, BarChart3, Shapes,
  User, Rocket, Briefcase, GraduationCap, GitBranch,
  Zap, Calendar, CalendarRange, CalendarClock, Infinity,
  Users, UsersRound, Building2,
  ShieldCheck, BookOpen, Heart, TrendingUp,
}

const TOTAL_STEPS = ONBOARDING_STEPS.length + 1 // +1 for summary

interface ProjectOnboardingProps {
  onComplete: (answers: OnboardingAnswers) => void
}

const emptyAnswers: OnboardingAnswers = {
  description: '',
  projectType: '',
  audience: '',
  timeline: '',
  teamSize: '',
  priorities: [],
}

export function ProjectOnboarding({ onComplete }: ProjectOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<OnboardingAnswers>(emptyAnswers)
  const [direction, setDirection] = useState(1)
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({})

  const step = ONBOARDING_STEPS[currentStep] as (typeof ONBOARDING_STEPS)[number] | undefined
  const isSummary = currentStep === ONBOARDING_STEPS.length

  const canContinue = () => {
    if (isSummary) return true
    if (!step) return false
    const value = answers[step.id]
    if (step.type === 'textarea') return (value as string).trim().length > 0
    if (step.type === 'multi') return (value as string[]).length > 0
    return (value as string).length > 0
  }

  const goNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1) {
      setDirection(1)
      setCurrentStep((s) => s + 1)
    }
  }, [currentStep])

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep((s) => s - 1)
    }
  }, [currentStep])

  const goToStep = useCallback((idx: number) => {
    setDirection(idx > currentStep ? 1 : -1)
    setCurrentStep(idx)
  }, [currentStep])

  const setSingleAnswer = (key: keyof OnboardingAnswers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  const toggleMultiAnswer = (key: keyof OnboardingAnswers, value: string) => {
    setAnswers((prev) => {
      const arr = prev[key] as string[]
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      }
    })
  }

  const handleOptionClick = (label: string) => {
    if (!step) return
    if (label === 'Other') {
      // When "Other" is clicked, set it as selected but don't auto-advance
      setSingleAnswer(step.id, customInputs[step.id] || 'Other')
      return
    }
    if (step.type === 'multi') {
      toggleMultiAnswer(step.id, label)
    } else {
      setSingleAnswer(step.id, label)
      // Auto-advance on single select (small delay for visual feedback)
      setTimeout(goNext, 200)
    }
  }

  const handleCustomInput = (stepId: string, value: string) => {
    setCustomInputs((prev) => ({ ...prev, [stepId]: value }))
    setSingleAnswer(stepId as keyof OnboardingAnswers, value || 'Other')
  }

  const isSelected = (label: string): boolean => {
    if (!step) return false
    const value = answers[step.id]
    if (step.type === 'multi') return (value as string[]).includes(label)
    if (label === 'Other') {
      const options = step.options?.map((o) => o.label) ?? []
      return typeof value === 'string' && !options.filter((o) => o !== 'Other').includes(value) && value !== ''
    }
    return value === label
  }

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  }

  return (
    <div className="h-full flex flex-col items-center justify-center bg-background p-6">
      {/* Progress dots */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <button
            key={i}
            onClick={() => i < currentStep && goToStep(i)}
            className={cn(
              'w-2.5 h-2.5 rounded-full transition-all duration-300',
              i === currentStep
                ? 'bg-primary w-8'
                : i < currentStep
                  ? 'bg-primary/50 cursor-pointer hover:bg-primary/70'
                  : 'bg-muted'
            )}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="w-full max-w-2xl flex-1 flex flex-col justify-center min-h-0">
        <AnimatePresence mode="wait" custom={direction}>
          {isSummary ? (
            <motion.div
              key="summary"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Ready to plan?</h1>
                <p className="text-muted-foreground mt-2">
                  Review your answers below, then let&apos;s build your roadmap
                </p>
              </div>

              <div className="space-y-3">
                {ONBOARDING_STEPS.map((s, i) => {
                  const value = answers[s.id]
                  const display = Array.isArray(value) ? value.join(', ') : value
                  return (
                    <button
                      key={s.id}
                      onClick={() => goToStep(i)}
                      className="w-full flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors text-left group"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground">{s.question}</p>
                        <p className="font-medium truncate">{display || '—'}</p>
                      </div>
                      <Pencil className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-3" />
                    </button>
                  )
                })}
              </div>

              <div className="pt-4 flex justify-center">
                <Button
                  size="lg"
                  onClick={() => onComplete(answers)}
                  className="gap-2 px-8"
                >
                  <Sparkles className="h-4 w-4" />
                  Start Planning
                </Button>
              </div>
            </motion.div>
          ) : step ? (
            <motion.div
              key={step.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="space-y-6"
            >
              <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">{step.question}</h1>
                <p className="text-muted-foreground mt-2">{step.subtitle}</p>
              </div>

              {step.type === 'textarea' ? (
                <textarea
                  autoFocus
                  value={answers.description}
                  onChange={(e) => setSingleAnswer('description', e.target.value)}
                  placeholder="e.g. A task management app that uses AI to auto-prioritize work..."
                  className="w-full h-40 p-4 rounded-xl border bg-card text-base resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/60"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.metaKey && canContinue()) goNext()
                  }}
                />
              ) : (
                <div className={cn(
                  'grid gap-3',
                  step.options && step.options.length <= 4 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'
                )}>
                  {step.options?.map((opt) => {
                    const Icon = ICON_MAP[opt.icon]
                    const selected = isSelected(opt.label)
                    return (
                      <button
                        key={opt.label}
                        onClick={() => handleOptionClick(opt.label)}
                        className={cn(
                          'flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-150',
                          'hover:border-primary/50 hover:bg-primary/5',
                          selected
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-card'
                        )}
                      >
                        {Icon && <Icon className={cn('h-6 w-6', selected ? 'text-primary' : 'text-muted-foreground')} />}
                        <span className={cn('font-medium text-sm', selected ? 'text-primary' : 'text-foreground')}>
                          {opt.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Custom input for "Other" */}
              {step.type === 'single' && step.options?.some((o) => o.label === 'Other') && isSelected('Other') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <input
                    autoFocus
                    type="text"
                    value={customInputs[step.id] || ''}
                    onChange={(e) => handleCustomInput(step.id, e.target.value)}
                    placeholder="Type your answer..."
                    className="w-full p-3 rounded-lg border bg-card text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && canContinue()) goNext()
                    }}
                  />
                </motion.div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {!isSummary && (
        <div className="flex items-center justify-between w-full max-w-2xl pt-6">
          <Button
            variant="ghost"
            onClick={goBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentStep + 1} of {ONBOARDING_STEPS.length}
          </span>
          <Button
            onClick={goNext}
            disabled={!canContinue()}
            className="gap-2"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {isSummary && (
        <div className="flex items-center justify-between w-full max-w-2xl pt-6">
          <Button variant="ghost" onClick={goBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div />
          <div />
        </div>
      )}
    </div>
  )
}
