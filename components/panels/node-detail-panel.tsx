'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Copy, ChevronDown, ChevronRight, Plus, HelpCircle, Check, ImagePlus, Link, Upload, FileText, Terminal, Clipboard, Pencil, Sparkles, Loader2, AlertCircle, MessageSquarePlus, PenLine, AlertTriangle, CornerDownRight } from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { useProjectStore } from '@/stores/project-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NodeEditForm } from './node-edit-form'
import { RichTextEditor } from './rich-text-editor'
import { NODE_CONFIG, STATUS_COLORS, NODE_CHILD_TYPE, QUESTION_CATEGORIES } from '@/lib/constants'
import type { NodeType } from '@/types/project'
import { cn } from '@/lib/utils'
import { buildNodeContext, buildPrdContext } from '@/lib/node-context'
import { authFetch } from '@/lib/auth-fetch'

export function NodeDetailPanel() {
  const { selectedNodeId, detailPanelOpen, closeDetailPanel } = useUIStore()
  const currentProject = useProjectStore((s) => s.currentProject)
  const deleteNode = useProjectStore((s) => s.deleteNode)
  const toggleNodeCollapse = useProjectStore((s) => s.toggleNodeCollapse)
  const addChildNode = useProjectStore((s) => s.addChildNode)
  const duplicateNode = useProjectStore((s) => s.duplicateNode)
  const answerNodeQuestion = useProjectStore((s) => s.answerNodeQuestion)

  const [addingChild, setAddingChild] = useState(false)
  const [childTitle, setChildTitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const updateNodeRichContent = useProjectStore((s) => s.updateNodeRichContent)
  const addNodeImage = useProjectStore((s) => s.addNodeImage)
  const removeNodeImage = useProjectStore((s) => s.removeNodeImage)
  const addNodePRD = useProjectStore((s) => s.addNodePRD)
  const updateNodePRD = useProjectStore((s) => s.updateNodePRD)
  const removeNodePRD = useProjectStore((s) => s.removeNodePRD)
  const addNodePrompt = useProjectStore((s) => s.addNodePrompt)
  const updateNodePrompt = useProjectStore((s) => s.updateNodePrompt)
  const removeNodePrompt = useProjectStore((s) => s.removeNodePrompt)
  const addNodeQuestions = useProjectStore((s) => s.addNodeQuestions)
  const addCustomNodeQuestion = useProjectStore((s) => s.addCustomNodeQuestion)

  const [editingPRD, setEditingPRD] = useState<string | null>(null)
  const [prdTitle, setPrdTitle] = useState('')
  const [prdContent, setPrdContent] = useState('')
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null)
  const [promptTitle, setPromptTitle] = useState('')
  const [promptContent, setPromptContent] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [generatingPRD, setGeneratingPRD] = useState(false)
  const [generatingPrompt, setGeneratingPrompt] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [generatingQuestions, setGeneratingQuestions] = useState(false)
  const [generatingFollowUps, setGeneratingFollowUps] = useState(false)
  const [submittingAnswers, setSubmittingAnswers] = useState(false)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customQuestion, setCustomQuestion] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const node = currentProject?.nodes.find((n) => n.id === selectedNodeId)
  const parent = node?.parentId
    ? currentProject?.nodes.find((n) => n.id === node.parentId)
    : null
  const children = currentProject?.nodes.filter((n) => n.parentId === selectedNodeId) || []
  const childType = node ? NODE_CHILD_TYPE[node.type] : null

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024
  const COMPRESS_THRESHOLD = 1 * 1024 * 1024
  const MAX_DIMENSION = 1200

  const compressImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('Canvas not supported')); return }
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }, [])

  const fileToDataUrl = useCallback(async (file: File): Promise<string> => {
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error(`Image too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max size is 5MB.`)
    }
    if (file.size > COMPRESS_THRESHOLD) {
      return compressImage(file)
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }, [compressImage])

  const handleImageFiles = useCallback(async (files: FileList | File[]) => {
    if (!node) return
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      try {
        const dataUrl = await fileToDataUrl(file)
        addNodeImage(node.id, dataUrl)
      } catch (err) {
        setGenerateError(err instanceof Error ? err.message : 'Failed to process image')
      }
    }
  }, [node, addNodeImage, fileToDataUrl])

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    if (!node || node.type !== 'moodboard') return
    const items = e.clipboardData?.items
    if (!items) return
    const imageFiles: File[] = []
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) imageFiles.push(file)
      }
    }
    if (imageFiles.length > 0) {
      e.preventDefault()
      await handleImageFiles(imageFiles)
    }
  }, [node, handleImageFiles])

  function handleAddChild() {
    if (!node || !childTitle.trim()) return
    const newId = addChildNode(node.id, childTitle.trim())
    setChildTitle('')
    setAddingChild(false)
    if (newId) {
      useUIStore.getState().selectNode(newId)
    }
  }

  function handleDuplicate() {
    if (!node) return
    const newId = duplicateNode(node.id, true)
    if (newId) {
      useUIStore.getState().selectNode(newId)
    }
  }

  const canGenerate = node?.type === 'goal' || node?.type === 'subgoal' || node?.type === 'feature' || node?.type === 'task'

  async function handleGeneratePRD() {
    if (!node || !currentProject || generatingPRD) return
    setGeneratingPRD(true)
    setGenerateError(null)
    try {
      const context = buildPrdContext(node.id, currentProject)
      const res = await authFetch('/api/ai/generate-prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context }),
      })
      if (!res.ok) throw new Error('Failed to generate PRD')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      addNodePRD(node.id, data.title, data.content, data.referencedPrdIds)
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Failed to generate PRD')
    } finally {
      setGeneratingPRD(false)
    }
  }

  async function handleGeneratePrompt() {
    if (!node || !currentProject || generatingPrompt) return
    setGeneratingPrompt(true)
    setGenerateError(null)
    try {
      const context = buildNodeContext(node.id, currentProject)
      const res = await authFetch('/api/ai/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context }),
      })
      if (!res.ok) throw new Error('Failed to generate prompt')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      addNodePrompt(node.id, data.title, data.content)
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Failed to generate prompt')
    } finally {
      setGeneratingPrompt(false)
    }
  }

  async function handleGenerateQuestions() {
    if (!node || !currentProject || generatingQuestions) return
    setGeneratingQuestions(true)
    setGenerateError(null)
    try {
      const context = buildNodeContext(node.id, currentProject)
      const res = await authFetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context }),
      })
      if (!res.ok) throw new Error('Failed to generate questions')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (data.questions && data.questions.length > 0) {
        const wasEmpty = (node.questions?.length ?? 0) === 0
        addNodeQuestions(node.id, data.questions)
        if (wasEmpty) {
          const newCategories = new Set<string>(
            data.questions.map((q: { category?: string }) => q.category ?? 'Other')
          )
          setExpandedCategories(newCategories)
        }
      }
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Failed to generate questions')
    } finally {
      setGeneratingQuestions(false)
    }
  }

  async function handleGenerateFollowUps() {
    if (!node || !currentProject || generatingFollowUps) return
    const answeredQA = node.questions.filter((q) => (q.answer ?? '').trim())
    if (answeredQA.length < 2) return
    setGeneratingFollowUps(true)
    setGenerateError(null)
    try {
      const context = buildNodeContext(node.id, currentProject)
      const previousQA = answeredQA.map((q) => ({
        id: q.id,
        question: q.question,
        answer: q.answer,
        category: q.category,
      }))
      const res = await authFetch('/api/ai/generate-followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, previousQA }),
      })
      if (!res.ok) throw new Error('Failed to generate follow-up questions')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (data.questions && data.questions.length > 0) {
        const followUps = data.questions.map((q: { question: string; options: string[]; category?: string; followUpForId?: string }) => ({
          ...q,
          isFollowUp: true,
        }))
        addNodeQuestions(node.id, followUps)
        setExpandedCategories((prev) => {
          const next = new Set(prev)
          followUps.forEach((q: { category?: string }) => next.add(q.category ?? 'Other'))
          return next
        })
      }
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Failed to generate follow-up questions')
    } finally {
      setGeneratingFollowUps(false)
    }
  }

  async function handleSubmitAnswers() {
    if (!node || !currentProject || submittingAnswers) return
    const answered = node.questions.filter((q) => (q.answer ?? '').trim())
    if (answered.length === 0) return

    setSubmittingAnswers(true)
    setGenerateError(null)
    try {
      const context = buildPrdContext(node.id, currentProject)
      const [prdRes, promptRes] = await Promise.all([
        authFetch('/api/ai/generate-prd', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ context }),
        }),
        authFetch('/api/ai/generate-prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ context }),
        }),
      ])

      if (!prdRes.ok) throw new Error('Failed to generate PRD')
      if (!promptRes.ok) throw new Error('Failed to generate prompt')

      const prdData = await prdRes.json()
      const promptData = await promptRes.json()

      if (prdData.error) throw new Error(prdData.error)
      if (promptData.error) throw new Error(promptData.error)

      addNodePRD(node.id, prdData.title, prdData.content, prdData.referencedPrdIds)
      addNodePrompt(node.id, promptData.title, promptData.content)
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Failed to generate from answers')
    } finally {
      setSubmittingAnswers(false)
    }
  }

  function handleAddCustomQuestion() {
    if (!node || !customQuestion.trim()) return
    addCustomNodeQuestion(node.id, customQuestion.trim())
    setCustomQuestion('')
    setShowCustomInput(false)
  }

  const answeredCount = node?.questions.filter((q) => (q.answer ?? '').trim()).length ?? 0
  const totalCount = node?.questions.length ?? 0
  const readinessPct = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0

  // Group questions by category
  const questionsByCategory = (() => {
    if (!node) return []
    const nodeCategories = node.type in QUESTION_CATEGORIES
      ? (QUESTION_CATEGORIES as Record<string, string[]>)[node.type]
      : []
    const grouped = new Map<string, typeof node.questions>()
    nodeCategories.forEach((cat) => grouped.set(cat, []))
    node.questions.forEach((q) => {
      const cat = q.category && nodeCategories.includes(q.category) ? q.category : 'Other'
      if (!grouped.has(cat)) grouped.set(cat, [])
      grouped.get(cat)!.push(q)
    })
    return Array.from(grouped.entries()).filter(([, qs]) => qs.length > 0)
  })()

  return (
    <AnimatePresence>
      {detailPanelOpen && node && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="w-80 border-l bg-background h-full overflow-y-auto shrink-0"
        >
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <Badge className={NODE_CONFIG[node.type].badgeClass}>
                {NODE_CONFIG[node.type].label}
              </Badge>
              <Button variant="ghost" size="icon" onClick={closeDetailPanel}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Edit form */}
            <NodeEditForm
              nodeId={node.id}
              title={node.title}
              description={node.description}
            />

            {/* Questions */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5" />
                  Questions ({answeredCount}/{totalCount})
                  {totalCount > 0 && (
                    <span className={cn(
                      'flex items-center gap-0.5 text-[10px] font-semibold',
                      readinessPct === 100 ? 'text-green-500' : readinessPct > 0 ? 'text-amber-500' : 'text-red-400'
                    )}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{
                        backgroundColor: readinessPct === 100 ? '#22c55e' : readinessPct > 0 ? '#f59e0b' : '#f87171'
                      }} />
                      {readinessPct}%
                    </span>
                  )}
                </label>
                <button
                  onClick={handleGenerateQuestions}
                  disabled={generatingQuestions}
                  className="flex items-center gap-1 text-xs text-purple-500 hover:text-purple-400 transition-colors disabled:opacity-50"
                >
                  {generatingQuestions ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <MessageSquarePlus className="h-3.5 w-3.5" />
                  )}
                  {totalCount > 0 ? 'Ask More' : 'Generate'}
                </button>
              </div>

              {totalCount > 0 && (
                <div className="space-y-2">
                  {questionsByCategory.map(([category, questions]) => {
                    const catAnswered = questions.filter((q) => (q.answer ?? '').trim()).length
                    const catTotal = questions.length
                    const isExpanded = expandedCategories.has(category)
                    return (
                      <div key={category} className="rounded-lg border bg-card overflow-hidden">
                        <button
                          onClick={() => setExpandedCategories((prev) => {
                            const next = new Set(prev)
                            if (next.has(category)) next.delete(category)
                            else next.add(category)
                            return next
                          })}
                          className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-1.5">
                            {isExpanded ? (
                              <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                            ) : (
                              <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                            )}
                            <span className="text-xs font-medium">{category}</span>
                          </div>
                          <span className={cn(
                            'text-[10px] font-medium shrink-0',
                            catAnswered === catTotal ? 'text-green-500' : catAnswered > 0 ? 'text-amber-500' : 'text-muted-foreground'
                          )}>
                            {catAnswered === catTotal ? '✓' : '○'} {catAnswered}/{catTotal}
                          </span>
                        </button>
                        {isExpanded && (
                          <div className="px-3 pb-3 space-y-2.5 border-t pt-2.5">
                            {questions.map((q) => (
                              <div key={q.id} className={cn('space-y-1.5', q.isFollowUp && 'ml-3 pl-2 border-l-2 border-muted')}>
                                <div className="flex items-start gap-1.5">
                                  {q.isFollowUp && (
                                    <CornerDownRight className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                                  )}
                                  <div className={cn(
                                    'w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                                    (q.answer ?? '').trim()
                                      ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                                      : 'bg-muted text-muted-foreground'
                                  )}>
                                    {(q.answer ?? '').trim() ? (
                                      <Check className="h-2.5 w-2.5" />
                                    ) : (
                                      <span className="text-[8px] font-bold">?</span>
                                    )}
                                  </div>
                                  <p className="text-xs font-medium leading-snug flex-1">
                                    {q.question}
                                    {q.isCustom && (
                                      <span className="ml-1.5 text-[10px] text-muted-foreground font-normal">(custom)</span>
                                    )}
                                  </p>
                                </div>
                                {q.options && q.options.length > 0 ? (
                                  <div className="space-y-1 ml-5">
                                    {q.options.map((option, optIdx) => (
                                      <button
                                        key={optIdx}
                                        onClick={() => answerNodeQuestion(node.id, q.id, option)}
                                        className={cn(
                                          'w-full text-left text-xs px-2.5 py-1.5 rounded-md border transition-colors',
                                          (q.answer ?? '') === option
                                            ? 'border-primary bg-primary/10 text-foreground font-medium'
                                            : 'border-transparent bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                                        )}
                                      >
                                        <span className="inline-flex items-center gap-2">
                                          <span className={cn(
                                            'w-3 h-3 rounded-full border-2 shrink-0 flex items-center justify-center',
                                            (q.answer ?? '') === option
                                              ? 'border-primary'
                                              : 'border-muted-foreground/40'
                                          )}>
                                            {(q.answer ?? '') === option && (
                                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            )}
                                          </span>
                                          {option}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <textarea
                                    value={q.answer}
                                    onChange={(e) => answerNodeQuestion(node.id, q.id, e.target.value)}
                                    placeholder="Type your answer..."
                                    rows={2}
                                    className="w-full text-xs px-2 py-1.5 rounded-md border bg-background text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/60 ml-5"
                                    style={{ width: 'calc(100% - 1.25rem)' }}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {totalCount === 0 && !generatingQuestions && (
                <p className="text-xs text-muted-foreground/60 italic">
                  No questions yet. Click &quot;Generate&quot; to get started.
                </p>
              )}

              {/* Ask Follow-ups */}
              {answeredCount >= 2 && (
                <button
                  onClick={handleGenerateFollowUps}
                  disabled={generatingFollowUps}
                  className="mt-2 flex items-center gap-1.5 text-xs text-purple-500 hover:text-purple-400 transition-colors disabled:opacity-50"
                >
                  {generatingFollowUps ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CornerDownRight className="h-3.5 w-3.5" />
                  )}
                  {generatingFollowUps ? 'Generating follow-ups...' : 'Ask Follow-ups'}
                </button>
              )}

              {/* Custom question */}
              {showCustomInput ? (
                <div className="mt-2 flex gap-1.5">
                  <input
                    autoFocus
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddCustomQuestion()
                      if (e.key === 'Escape') { setShowCustomInput(false); setCustomQuestion('') }
                    }}
                    placeholder="Type your own question or note..."
                    className="flex-1 text-xs px-2 py-1.5 rounded-md border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <Button size="sm" variant="ghost" className="h-7 px-2" onClick={handleAddCustomQuestion} disabled={!customQuestion.trim()}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => { setShowCustomInput(false); setCustomQuestion('') }}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <PenLine className="h-3.5 w-3.5" />
                  Add your own question
                </button>
              )}

              {/* Generate PRD */}
              {answeredCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-3 h-7 text-xs"
                  disabled={submittingAnswers}
                  onClick={handleSubmitAnswers}
                >
                  {submittingAnswers ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 mr-1.5" />
                      Generate PRD ({readinessPct}% ready)
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Generate Error */}
            {generateError && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-destructive flex-1">{generateError}</p>
                <button
                  onClick={() => setGenerateError(null)}
                  className="text-destructive hover:text-destructive/80 shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* PRDs */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  PRDs ({(node.prds || []).length})
                </label>
                <div className="flex items-center gap-1">
                  {canGenerate && (
                    <button
                      onClick={handleGeneratePRD}
                      disabled={generatingPRD}
                      className="p-1 rounded hover:bg-accent transition-colors disabled:opacity-50"
                      title="Generate PRD"
                    >
                      {generatingPRD ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-500" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => { setEditingPRD('new'); setPrdTitle(''); setPrdContent('') }}
                    className="p-1 rounded hover:bg-accent transition-colors"
                    title="Add PRD"
                  >
                    <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>
              {(node.prds || []).map((prd) => (
                <div key={prd.id} className={cn('mb-2 rounded-lg border bg-card', prd.isStale && 'border-amber-500/50')}>
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-1.5 truncate flex-1">
                      <span className="text-sm font-medium truncate">{prd.title}</span>
                      {prd.isStale && (
                        <span
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0"
                          title={prd.staleReason || 'Questions updated after generation'}
                        >
                          <AlertTriangle className="h-2.5 w-2.5" />
                          Stale
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(prd.content)
                          setCopiedId(prd.id)
                          setTimeout(() => setCopiedId(null), 2000)
                        }}
                        className="p-1 rounded hover:bg-accent transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedId === prd.id ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Clipboard className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </button>
                      <button
                        onClick={() => { setEditingPRD(prd.id); setPrdTitle(prd.title); setPrdContent(prd.content) }}
                        className="p-1 rounded hover:bg-accent transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => removeNodePRD(node.id, prd.id)}
                        className="p-1 rounded hover:bg-destructive/10 transition-colors"
                        title="Remove"
                      >
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                  {editingPRD === prd.id && (
                    <div className="px-3 pb-3 space-y-2 border-t pt-2">
                      <input
                        autoFocus
                        value={prdTitle}
                        onChange={(e) => setPrdTitle(e.target.value)}
                        placeholder="PRD title..."
                        className="w-full text-sm px-2 py-1.5 rounded-md border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      <textarea
                        value={prdContent}
                        onChange={(e) => setPrdContent(e.target.value)}
                        placeholder="Write your PRD content here..."
                        rows={8}
                        className="w-full text-sm px-2 py-1.5 rounded-md border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-y font-mono"
                      />
                      <div className="flex gap-1.5 justify-end">
                        <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditingPRD(null)}>Cancel</Button>
                        <Button
                          size="sm" className="h-7"
                          disabled={!prdTitle.trim() || !prdContent.trim()}
                          onClick={() => { updateNodePRD(node.id, prd.id, prdTitle.trim(), prdContent.trim()); setEditingPRD(null) }}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  )}
                  {editingPRD !== prd.id && (
                    <div className="px-3 pb-3 border-t">
                      <pre className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap font-mono max-h-24 overflow-y-auto">
                        {prd.content.length > 200 ? prd.content.slice(0, 200) + '...' : prd.content}
                      </pre>
                      {prd.referencedPrdIds && prd.referencedPrdIds.length > 0 && currentProject && (
                        <div className="mt-2 flex items-center gap-1 flex-wrap text-[10px]">
                          <span className="text-muted-foreground font-medium">References:</span>
                          {prd.referencedPrdIds.map((compoundKey) => {
                            const [refNodeId, refPrdId] = compoundKey.split(':')
                            const refNode = currentProject.nodes.find((n) => n.id === refNodeId)
                            const refPrd = refNode?.prds?.find((p) => p.id === refPrdId)
                            if (!refNode || !refPrd) return null
                            return (
                              <button
                                key={compoundKey}
                                onClick={() => useUIStore.getState().selectNode(refNodeId)}
                                className="text-primary hover:underline truncate max-w-[140px]"
                                title={`${refPrd.title} in ${refNode.title}`}
                              >
                                {refPrd.title}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {editingPRD === 'new' && (
                <div className="rounded-lg border bg-card px-3 py-3 space-y-2">
                  <input
                    autoFocus
                    value={prdTitle}
                    onChange={(e) => setPrdTitle(e.target.value)}
                    placeholder="PRD title..."
                    className="w-full text-sm px-2 py-1.5 rounded-md border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <textarea
                    value={prdContent}
                    onChange={(e) => setPrdContent(e.target.value)}
                    placeholder="Write your PRD content here..."
                    rows={8}
                    className="w-full text-sm px-2 py-1.5 rounded-md border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-y font-mono"
                  />
                  <div className="flex gap-1.5 justify-end">
                    <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditingPRD(null)}>Cancel</Button>
                    <Button
                      size="sm" className="h-7"
                      disabled={!prdTitle.trim() || !prdContent.trim()}
                      onClick={() => { addNodePRD(node.id, prdTitle.trim(), prdContent.trim()); setEditingPRD(null); setPrdTitle(''); setPrdContent('') }}
                    >
                      Create PRD
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Prompts */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5" />
                  Prompts ({(node.prompts || []).length})
                </label>
                <div className="flex items-center gap-1">
                  {canGenerate && (
                    <button
                      onClick={handleGeneratePrompt}
                      disabled={generatingPrompt}
                      className="p-1 rounded hover:bg-accent transition-colors disabled:opacity-50"
                      title="Generate Prompt"
                    >
                      {generatingPrompt ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-500" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => { setEditingPrompt('new'); setPromptTitle(''); setPromptContent('') }}
                    className="p-1 rounded hover:bg-accent transition-colors"
                    title="Add Prompt"
                  >
                    <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>
              {(node.prompts || []).map((prompt) => (
                <div key={prompt.id} className="mb-2 rounded-lg border bg-card">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm font-medium truncate flex-1">{prompt.title}</span>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(prompt.content)
                          setCopiedId(prompt.id)
                          setTimeout(() => setCopiedId(null), 2000)
                        }}
                        className="p-1 rounded hover:bg-accent transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedId === prompt.id ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Clipboard className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </button>
                      <button
                        onClick={() => { setEditingPrompt(prompt.id); setPromptTitle(prompt.title); setPromptContent(prompt.content) }}
                        className="p-1 rounded hover:bg-accent transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => removeNodePrompt(node.id, prompt.id)}
                        className="p-1 rounded hover:bg-destructive/10 transition-colors"
                        title="Remove"
                      >
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                  {editingPrompt === prompt.id && (
                    <div className="px-3 pb-3 space-y-2 border-t pt-2">
                      <input
                        autoFocus
                        value={promptTitle}
                        onChange={(e) => setPromptTitle(e.target.value)}
                        placeholder="Prompt title..."
                        className="w-full text-sm px-2 py-1.5 rounded-md border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      <textarea
                        value={promptContent}
                        onChange={(e) => setPromptContent(e.target.value)}
                        placeholder="Write your prompt here..."
                        rows={6}
                        className="w-full text-sm px-2 py-1.5 rounded-md border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-y font-mono"
                      />
                      <div className="flex gap-1.5 justify-end">
                        <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditingPrompt(null)}>Cancel</Button>
                        <Button
                          size="sm" className="h-7"
                          disabled={!promptTitle.trim() || !promptContent.trim()}
                          onClick={() => { updateNodePrompt(node.id, prompt.id, promptTitle.trim(), promptContent.trim()); setEditingPrompt(null) }}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  )}
                  {editingPrompt !== prompt.id && (
                    <div className="px-3 pb-3 border-t">
                      <pre className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap font-mono max-h-20 overflow-y-auto">
                        {prompt.content.length > 150 ? prompt.content.slice(0, 150) + '...' : prompt.content}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
              {editingPrompt === 'new' && (
                <div className="rounded-lg border bg-card px-3 py-3 space-y-2">
                  <input
                    autoFocus
                    value={promptTitle}
                    onChange={(e) => setPromptTitle(e.target.value)}
                    placeholder="Prompt title..."
                    className="w-full text-sm px-2 py-1.5 rounded-md border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <textarea
                    value={promptContent}
                    onChange={(e) => setPromptContent(e.target.value)}
                    placeholder="Write your prompt here..."
                    rows={6}
                    className="w-full text-sm px-2 py-1.5 rounded-md border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-y font-mono"
                  />
                  <div className="flex gap-1.5 justify-end">
                    <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditingPrompt(null)}>Cancel</Button>
                    <Button
                      size="sm" className="h-7"
                      disabled={!promptTitle.trim() || !promptContent.trim()}
                      onClick={() => { addNodePrompt(node.id, promptTitle.trim(), promptContent.trim()); setEditingPrompt(null); setPromptTitle(''); setPromptContent('') }}
                    >
                      Create Prompt
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Notes content */}
            {node.type === 'notes' && (
              <div className="mt-4">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Content</label>
                <RichTextEditor
                  content={node.content || ''}
                  onChange={(html) => updateNodeRichContent(node.id, html)}
                  placeholder="Write your notes here..."
                />
              </div>
            )}

            {/* Moodboard images */}
            {node.type === 'moodboard' && (
              <div className="mt-4" onPaste={handlePaste}>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Images ({(node.images || []).length})
                </label>
                {(node.images || []).length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {(node.images || []).map((url, i) => (
                      <div key={i} className="relative group/img aspect-video rounded overflow-hidden bg-muted">
                        <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeNodeImage(node.id, url)}
                          className="absolute top-1 right-1 p-0.5 rounded bg-black/60 text-white opacity-0 group-hover/img:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div
                  className={cn(
                    'border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer mb-2',
                    isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                  )}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={async (e) => {
                    e.preventDefault()
                    setIsDragging(false)
                    if (e.dataTransfer.files.length > 0) await handleImageFiles(e.dataTransfer.files)
                  }}
                >
                  <Upload className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Drop images, click to browse, or <span className="font-medium">Ctrl+V</span> to paste
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files) await handleImageFiles(e.target.files)
                      e.target.value = ''
                    }}
                  />
                </div>
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <Link className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && imageUrl.trim()) { addNodeImage(node.id, imageUrl.trim()); setImageUrl('') }
                      }}
                      placeholder="Or paste image URL..."
                      className="w-full text-sm pl-7 pr-2 py-1.5 rounded-md border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <Button
                    size="sm" variant="ghost" className="h-8 px-2"
                    disabled={!imageUrl.trim()}
                    onClick={() => { if (imageUrl.trim()) { addNodeImage(node.id, imageUrl.trim()); setImageUrl('') } }}
                  >
                    <ImagePlus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Parent */}
            {parent && (
              <div className="mt-4">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Parent</label>
                <button
                  onClick={() => useUIStore.getState().selectNode(parent.id)}
                  className="text-sm text-primary hover:underline"
                >
                  {parent.title}
                </button>
              </div>
            )}

            {/* Children */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Children ({children.length})
                </label>
                {children.length > 0 && (
                  <button
                    onClick={() => toggleNodeCollapse(node.id)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {node.collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    {node.collapsed ? 'Expand' : 'Collapse'}
                  </button>
                )}
              </div>
              {children.length > 0 && !node.collapsed && (
                <div className="space-y-1">
                  {children.map((child) => (
                    <div
                      key={child.id}
                      className="text-sm flex items-center gap-2 p-1.5 rounded hover:bg-accent cursor-pointer"
                      onClick={() => useUIStore.getState().selectNode(child.id)}
                    >
                      <div className={cn('w-2 h-2 rounded-full', STATUS_COLORS[child.status])} />
                      {child.title}
                    </div>
                  ))}
                </div>
              )}
              {childType && (
                <>
                  {addingChild ? (
                    <div className="mt-2 flex gap-1.5">
                      <input
                        autoFocus
                        value={childTitle}
                        onChange={(e) => setChildTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddChild()
                          if (e.key === 'Escape') { setAddingChild(false); setChildTitle('') }
                        }}
                        placeholder={`${NODE_CONFIG[childType].label} title...`}
                        className="flex-1 text-sm px-2 py-1 rounded-md border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={handleAddChild}>
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => { setAddingChild(false); setChildTitle('') }}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingChild(true)}
                      className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add {NODE_CONFIG[childType].label}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={handleDuplicate}>
                <Copy className="h-4 w-4" />
                Duplicate
              </Button>
              <Button
                variant="destructive" size="sm" className="flex-1"
                onClick={() => { deleteNode(node.id); closeDetailPanel() }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
