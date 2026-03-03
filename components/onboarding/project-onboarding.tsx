'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
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
  Loader2,
  Plus,
  X,
  Check,
  Shield,
  Lock,
  Cloud,
  Database,
  Code,
  Palette,
  Layout,
  MessageSquare,
  Bell,
  Settings,
  Target,
  Award,
  Layers,
  Package,
  Plug,
  Cpu,
  Wifi,
  Map,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ONBOARDING_STEPS } from '@/lib/onboarding-config'
import type { DynamicOnboardingQuestion } from '@/lib/onboarding-config'
import type { OnboardingAnswers } from '@/types/chat'
import { authFetch } from '@/lib/auth-fetch'

const ICON_MAP: Record<string, LucideIcon> = {
  Globe, Smartphone, Server, Monitor, BarChart3, Shapes,
  User, Rocket, Briefcase, GraduationCap, GitBranch,
  Zap, Calendar, CalendarRange, CalendarClock, Infinity,
  Users, UsersRound, Building2,
  ShieldCheck, BookOpen, Heart, TrendingUp,
  Shield, Lock, Cloud, Database, Code, Palette, Layout,
  MessageSquare, Bell, Settings, Target, Award, Layers,
  Package, Plug, Cpu, Wifi, Map,
}

interface ProjectOnboardingProps {
  onComplete: (answers: OnboardingAnswers) => void
}

const emptyAnswers: OnboardingAnswers = {
  description: '',
  projectType: '',
  features: [],
}

export function ProjectOnboarding({ onComplete }: ProjectOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<OnboardingAnswers>(emptyAnswers)
  const [direction, setDirection] = useState(1)
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({})
  const [suggestedFeatures, setSuggestedFeatures] = useState<string[]>([])
  const [featuresLoading, setFeaturesLoading] = useState(false)
  const [customFeature, setCustomFeature] = useState('')
  const [skippedSteps, setSkippedSteps] = useState<Set<string>>(new Set())
  const [dynamicQuestions, setDynamicQuestions] = useState<DynamicOnboardingQuestion[]>([])
  const featuresFetchedRef = useRef(false)

  const FIXED_STEPS = ONBOARDING_STEPS.length // 3
  const TOTAL_STEPS = FIXED_STEPS + dynamicQuestions.length + 1 // +1 for summary

  const isFixedStep = currentStep < FIXED_STEPS
  const isDynamicStep = currentStep >= FIXED_STEPS && currentStep < FIXED_STEPS + dynamicQuestions.length
  const isSummary = currentStep === TOTAL_STEPS - 1

  const step = isFixedStep ? ONBOARDING_STEPS[currentStep] : undefined
  const dynamicStep = isDynamicStep ? dynamicQuestions[currentStep - FIXED_STEPS] : undefined

  // Fetch AI feature suggestions + dynamic questions once description + projectType are filled
  useEffect(() => {
    if (
      answers.description.trim() &&
      answers.projectType &&
      !featuresFetchedRef.current
    ) {
      featuresFetchedRef.current = true
      setFeaturesLoading(true)
      authFetch('/api/ai/suggest-features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: answers.description,
          projectType: answers.projectType,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.features) setSuggestedFeatures(data.features)
          if (data.tailoredQuestions) setDynamicQuestions(data.tailoredQuestions)
        })
        .catch(() => {})
        .finally(() => setFeaturesLoading(false))
    }
  }, [answers.description, answers.projectType])

  const canContinue = () => {
    if (isSummary) return true
    if (isDynamicStep && dynamicStep) {
      const val = answers.dynamicAnswers?.[dynamicStep.question]
      if (dynamicStep.type === 'multi') return Array.isArray(val) && val.length > 0
      return typeof val === 'string' && val.length > 0
    }
    if (!step) return false
    const value = answers[step.id]
    if (step.type === 'textarea') return (value as string).trim().length > 0
    if (step.type === 'multi') return (value as string[]).length > 0
    if (step.type === 'features') return true
    return (value as string).length > 0
  }

  const goNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1) {
      setDirection(1)
      setCurrentStep((s) => s + 1)
    }
  }, [currentStep, TOTAL_STEPS])

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

  const handleSkip = useCallback(() => {
    if (isDynamicStep && dynamicStep) {
      // Clear dynamic answer
      setAnswers((prev) => {
        const da = { ...(prev.dynamicAnswers || {}) }
        delete da[dynamicStep.question]
        return { ...prev, dynamicAnswers: da }
      })
      setSkippedSteps((prev) => new Set(prev).add(`dynamic:${dynamicStep.id}`))
      goNext()
      return
    }
    if (!step) return
    if (step.type === 'multi' || step.type === 'features') {
      setAnswers((prev) => ({ ...prev, [step.id]: [] }))
    } else {
      setAnswers((prev) => ({ ...prev, [step.id]: '' }))
    }
    setSkippedSteps((prev) => new Set(prev).add(step.id))
    goNext()
  }, [step, dynamicStep, isDynamicStep, goNext])

  const setSingleAnswer = (key: keyof OnboardingAnswers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
    setSkippedSteps((prev) => {
      if (!prev.has(key)) return prev
      const next = new Set(prev)
      next.delete(key)
      return next
    })
  }

  const toggleMultiAnswer = (key: keyof OnboardingAnswers, value: string) => {
    setAnswers((prev) => {
      const arr = (prev[key] as string[]) || []
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      }
    })
    setSkippedSteps((prev) => {
      if (!prev.has(key)) return prev
      const next = new Set(prev)
      next.delete(key)
      return next
    })
  }

  // Dynamic question answer handlers
  const setDynamicSingleAnswer = (question: string, qId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      dynamicAnswers: { ...(prev.dynamicAnswers || {}), [question]: value },
    }))
    setSkippedSteps((prev) => {
      const key = `dynamic:${qId}`
      if (!prev.has(key)) return prev
      const next = new Set(prev)
      next.delete(key)
      return next
    })
  }

  const toggleDynamicMultiAnswer = (question: string, qId: string, value: string) => {
    setAnswers((prev) => {
      const existing = (prev.dynamicAnswers?.[question] as string[]) || []
      const updated = existing.includes(value)
        ? existing.filter((v) => v !== value)
        : [...existing, value]
      return {
        ...prev,
        dynamicAnswers: { ...(prev.dynamicAnswers || {}), [question]: updated },
      }
    })
    setSkippedSteps((prev) => {
      const key = `dynamic:${qId}`
      if (!prev.has(key)) return prev
      const next = new Set(prev)
      next.delete(key)
      return next
    })
  }

  const handleOptionClick = (label: string) => {
    if (!step) return
    if (label === 'Other') {
      setSingleAnswer(step.id, customInputs[step.id] || 'Other')
      return
    }
    if (step.type === 'multi') {
      toggleMultiAnswer(step.id, label)
    } else {
      setSingleAnswer(step.id, label)
      setTimeout(goNext, 200)
    }
  }

  const handleDynamicOptionClick = (dq: DynamicOnboardingQuestion, label: string) => {
    if (dq.type === 'multi') {
      toggleDynamicMultiAnswer(dq.question, dq.id, label)
    } else {
      setDynamicSingleAnswer(dq.question, dq.id, label)
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

  const isDynamicSelected = (dq: DynamicOnboardingQuestion, label: string): boolean => {
    const val = answers.dynamicAnswers?.[dq.question]
    if (dq.type === 'multi') return Array.isArray(val) && val.includes(label)
    return val === label
  }

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  }

  // Build summary items for display
  const summaryItems: { key: string; question: string; display: string | null; stepIndex: number }[] = []
  ONBOARDING_STEPS.forEach((s, i) => {
    const value = answers[s.id]
    const isEmpty = Array.isArray(value) ? value.length === 0 : !value
    const isSkipped = skippedSteps.has(s.id)
    const display = isSkipped || isEmpty
      ? null
      : Array.isArray(value) ? value.join(', ') : (value as string)
    summaryItems.push({ key: s.id, question: s.question, display, stepIndex: i })
  })
  dynamicQuestions.forEach((dq, i) => {
    const val = answers.dynamicAnswers?.[dq.question]
    const isEmpty = !val || (Array.isArray(val) && val.length === 0)
    const isSkipped = skippedSteps.has(`dynamic:${dq.id}`)
    const display = isSkipped || isEmpty
      ? null
      : Array.isArray(val) ? val.join(', ') : (val as string)
    summaryItems.push({ key: `dq-${dq.id}`, question: dq.question, display, stepIndex: FIXED_STEPS + i })
  })

  return (
    <div className="h-full flex flex-col items-center bg-background p-6 overflow-y-auto">
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
      <div className={cn(
        'w-full max-w-2xl flex-1 flex flex-col min-h-0',
        isSummary ? 'justify-start overflow-y-auto' : 'justify-center'
      )}>
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
                {summaryItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => goToStep(item.stepIndex)}
                    className="w-full flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors text-left group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">{item.question}</p>
                      {item.display ? (
                        <p className="font-medium truncate">{item.display}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground/60 italic">Skipped</p>
                      )}
                    </div>
                    <Pencil className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-3" />
                  </button>
                ))}
              </div>

            </motion.div>
          ) : isDynamicStep && dynamicStep ? (
            <motion.div
              key={`dq-${dynamicStep.id}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="space-y-6"
            >
              <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">{dynamicStep.question}</h1>
                <p className="text-muted-foreground mt-2">{dynamicStep.subtitle}</p>
              </div>

              <div className={cn(
                'grid gap-3',
                dynamicStep.options.length <= 4 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'
              )}>
                {dynamicStep.options.map((opt) => {
                  const Icon = ICON_MAP[opt.icon]
                  const selected = isDynamicSelected(dynamicStep, opt.label)
                  return (
                    <button
                      key={opt.label}
                      onClick={() => handleDynamicOptionClick(dynamicStep, opt.label)}
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
                  className="w-full h-40 p-4 rounded-xl border bg-card text-foreground text-base resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/60"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.metaKey && canContinue()) goNext()
                  }}
                />
              ) : step.type === 'features' ? (
                <div className="space-y-4">
                  {featuresLoading ? (
                    <div className="flex flex-col items-center gap-3 py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">AI is analyzing your project...</p>
                    </div>
                  ) : suggestedFeatures.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        {suggestedFeatures.map((feature) => {
                          const selected = (answers.features as string[]).includes(feature)
                          return (
                            <button
                              key={feature}
                              onClick={() => toggleMultiAnswer('features', feature)}
                              className={cn(
                                'flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-all duration-150 text-sm',
                                'hover:border-primary/50 hover:bg-primary/5',
                                selected
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border bg-card'
                              )}
                            >
                              <div className={cn(
                                'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0',
                                selected ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                              )}>
                                {selected && <Check className="h-3 w-3 text-primary-foreground" />}
                              </div>
                              <span className={cn('font-medium', selected ? 'text-primary' : 'text-foreground')}>
                                {feature}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                      {/* Custom feature add */}
                      {(answers.features as string[]).filter((f) => !suggestedFeatures.includes(f)).map((f) => (
                        <div key={f} className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-primary bg-primary/10 text-sm">
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="font-medium text-primary flex-1">{f}</span>
                          <button onClick={() => toggleMultiAnswer('features', f)} className="hover:opacity-70">
                            <X className="h-3.5 w-3.5 text-primary" />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customFeature}
                          onChange={(e) => setCustomFeature(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && customFeature.trim()) {
                              toggleMultiAnswer('features', customFeature.trim())
                              setCustomFeature('')
                            }
                          }}
                          placeholder="Add your own feature..."
                          className="flex-1 px-3 py-2 rounded-lg border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!customFeature.trim()}
                          onClick={() => {
                            if (customFeature.trim()) {
                              toggleMultiAnswer('features', customFeature.trim())
                              setCustomFeature('')
                            }
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">No suggestions available. Add your own features below.</p>
                      <div className="flex gap-2 mt-4 max-w-sm mx-auto">
                        <input
                          type="text"
                          value={customFeature}
                          onChange={(e) => setCustomFeature(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && customFeature.trim()) {
                              toggleMultiAnswer('features', customFeature.trim())
                              setCustomFeature('')
                            }
                          }}
                          placeholder="Type a feature..."
                          className="flex-1 px-3 py-2 rounded-lg border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!customFeature.trim()}
                          onClick={() => {
                            if (customFeature.trim()) {
                              toggleMultiAnswer('features', customFeature.trim())
                              setCustomFeature('')
                            }
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
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
                    className="w-full p-3 rounded-lg border bg-card text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
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
          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <button
                onClick={handleSkip}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip
              </button>
            )}
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} of {TOTAL_STEPS - 1}
            </span>
          </div>
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
        <div className="flex items-center justify-between w-full max-w-2xl pt-6 shrink-0">
          <Button variant="ghost" onClick={goBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            size="lg"
            onClick={() => onComplete(answers)}
            className="gap-2 px-8"
          >
            <Sparkles className="h-4 w-4" />
            Start Planning
          </Button>
          <div />
        </div>
      )}
    </div>
  )
}
