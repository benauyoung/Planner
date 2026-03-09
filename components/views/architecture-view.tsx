'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  X,
  Trash2,
  Pencil,
  Send,
  Loader2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Monitor,
  Server,
  Database,
  Shield,
  Cloud,
  Layers,
  GitBranch,
  FolderTree,
  TestTube2,
  Plug,
  Zap,
  MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProjectStore } from '@/stores/project-store'
import { generateId } from '@/lib/id'
import { cn } from '@/lib/utils'
import { authFetch } from '@/lib/auth-fetch'
import { buildArchitectureContext } from '@/lib/architecture-context'
import type { ArchitectureDecision, ArchitectureCategory, ArchitectureStatus, ArchitectureChatMessage } from '@/types/project'

// ── Category Config ──────────────────────────────────────────

const CATEGORY_CONFIG: Record<ArchitectureCategory, { label: string; icon: typeof Monitor; color: string; bg: string }> = {
  frontend: { label: 'Frontend', icon: Monitor, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  backend: { label: 'Backend', icon: Server, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  database: { label: 'Database', icon: Database, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  auth: { label: 'Authentication', icon: Shield, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  deployment: { label: 'Deployment', icon: Cloud, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  state_management: { label: 'State Management', icon: Layers, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-200' },
  api_design: { label: 'API Design', icon: GitBranch, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
  file_structure: { label: 'File Structure', icon: FolderTree, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  testing: { label: 'Testing', icon: TestTube2, color: 'text-lime-600', bg: 'bg-lime-50 border-lime-200' },
  third_party: { label: 'Third-Party Services', icon: Plug, color: 'text-pink-600', bg: 'bg-pink-50 border-pink-200' },
  caching: { label: 'Caching', icon: Zap, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' },
  other: { label: 'Other', icon: MoreHorizontal, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
}

const STATUS_STYLES: Record<ArchitectureStatus, { label: string; cls: string }> = {
  proposed: { label: 'Proposed', cls: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  accepted: { label: 'Accepted', cls: 'bg-green-100 text-green-700 border-green-300' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700 border-red-300' },
}

const STARTER_PROMPTS = [
  'What tech stack fits my project?',
  'How should I handle authentication?',
  'What database should I use?',
  'Help me plan my API structure',
]

// ── Decision Parsing ─────────────────────────────────────────

function parseDecisionsFromStream(text: string): { message: string; decisions: Omit<ArchitectureDecision, 'id' | 'status' | 'createdAt' | 'updatedAt'>[] } {
  const decisionsIdx = text.indexOf('\nDECISIONS:')
  const messageRaw = decisionsIdx >= 0 ? text.slice(0, decisionsIdx) : text
  const message = messageRaw.replace(/^MESSAGE:\s*/i, '').trim()

  const decisions: Omit<ArchitectureDecision, 'id' | 'status' | 'createdAt' | 'updatedAt'>[] = []

  if (decisionsIdx >= 0) {
    const decisionsBlock = text.slice(decisionsIdx + '\nDECISIONS:'.length)
    const blocks = decisionsBlock.split('---').filter((b) => b.trim())

    for (const block of blocks) {
      const category = block.match(/CATEGORY:\s*(.+)/i)?.[1]?.trim() as ArchitectureCategory | undefined
      const title = block.match(/TITLE:\s*(.+)/i)?.[1]?.trim()
      const description = block.match(/DESCRIPTION:\s*(.+)/i)?.[1]?.trim()
      const rationale = block.match(/RATIONALE:\s*(.+)/i)?.[1]?.trim()
      const alternativesRaw = block.match(/ALTERNATIVES:\s*(.+)/i)?.[1]?.trim()

      if (category && title && description && rationale) {
        decisions.push({
          category,
          title,
          description,
          rationale,
          alternatives: alternativesRaw ? alternativesRaw.split('|').map((a) => a.trim()).filter(Boolean) : undefined,
        })
      }
    }
  }

  return { message, decisions }
}

// ── Decision Card ────────────────────────────────────────────

function DecisionCard({
  decision,
  onStatusChange,
  onUpdate,
  onDelete,
}: {
  decision: ArchitectureDecision
  onStatusChange: (status: ArchitectureStatus) => void
  onUpdate: (updates: Partial<ArchitectureDecision>) => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(decision.title)
  const [editDesc, setEditDesc] = useState(decision.description)
  const [editRationale, setEditRationale] = useState(decision.rationale)
  const config = CATEGORY_CONFIG[decision.category] || CATEGORY_CONFIG.other
  const statusStyle = STATUS_STYLES[decision.status]

  const handleSave = () => {
    onUpdate({
      title: editTitle.trim() || decision.title,
      description: editDesc.trim() || decision.description,
      rationale: editRationale.trim() || decision.rationale,
    })
    setEditing(false)
  }

  return (
    <div className={cn('rounded-lg border p-3 space-y-2 transition-colors', decision.status === 'rejected' && 'opacity-50')}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-sm font-semibold bg-transparent border-b border-primary outline-none"
              autoFocus
            />
          ) : (
            <h4 className="text-sm font-semibold truncate">{decision.title}</h4>
          )}
        </div>
        <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0', statusStyle.cls)}>
          {statusStyle.label}
        </span>
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            className="w-full text-xs bg-muted/50 rounded p-2 outline-none resize-none"
            rows={2}
            placeholder="Description"
          />
          <textarea
            value={editRationale}
            onChange={(e) => setEditRationale(e.target.value)}
            className="w-full text-xs bg-muted/50 rounded p-2 outline-none resize-none"
            rows={2}
            placeholder="Rationale"
          />
          <div className="flex gap-1">
            <Button size="sm" variant="default" className="h-6 text-[10px]" onClick={handleSave}>Save</Button>
            <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">{decision.description}</p>
          <div className="text-xs text-muted-foreground/80 bg-muted/30 rounded px-2 py-1.5 italic">
            {decision.rationale}
          </div>
          {decision.alternatives && decision.alternatives.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {decision.alternatives.map((alt, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {alt}
                </span>
              ))}
            </div>
          )}
        </>
      )}

      {!editing && (
        <div className="flex items-center gap-1 pt-1">
          {decision.status !== 'accepted' && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-green-600 hover:bg-green-50"
              onClick={() => onStatusChange('accepted')}
              title="Accept"
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
          {decision.status !== 'rejected' && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-red-500 hover:bg-red-50"
              onClick={() => onStatusChange('rejected')}
              title="Reject"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {decision.status !== 'proposed' && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-yellow-600 hover:bg-yellow-50"
              onClick={() => onStatusChange('proposed')}
              title="Reset to proposed"
            >
              <Sparkles className="h-3 w-3" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => {
              setEditTitle(decision.title)
              setEditDesc(decision.description)
              setEditRationale(decision.rationale)
              setEditing(true)
            }}
            title="Edit"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
            onClick={onDelete}
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  )
}

// ── Category Section ─────────────────────────────────────────

function CategorySection({
  category,
  decisions,
  onStatusChange,
  onUpdate,
  onDelete,
}: {
  category: ArchitectureCategory
  decisions: ArchitectureDecision[]
  onStatusChange: (id: string, status: ArchitectureStatus) => void
  onUpdate: (id: string, updates: Partial<ArchitectureDecision>) => void
  onDelete: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other
  const Icon = config.icon

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left py-1.5 px-1 hover:bg-accent/50 rounded transition-colors"
      >
        {expanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
        <Icon className={cn('h-3.5 w-3.5', config.color)} />
        <span className="text-xs font-semibold flex-1">{config.label}</span>
        <span className="text-[10px] text-muted-foreground">{decisions.length}</span>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pl-6 pt-1 pb-2">
              {decisions.map((d) => (
                <DecisionCard
                  key={d.id}
                  decision={d}
                  onStatusChange={(status) => onStatusChange(d.id, status)}
                  onUpdate={(updates) => onUpdate(d.id, updates)}
                  onDelete={() => onDelete(d.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main Architecture View ───────────────────────────────────

export function ArchitectureView() {
  const currentProject = useProjectStore((s) => s.currentProject)
  const addDecision = useProjectStore((s) => s.addArchitectureDecision)
  const updateDecision = useProjectStore((s) => s.updateArchitectureDecision)
  const setDecisionStatus = useProjectStore((s) => s.setArchitectureDecisionStatus)
  const removeDecision = useProjectStore((s) => s.removeArchitectureDecision)
  const addChatMessage = useProjectStore((s) => s.addArchitectureChatMessage)

  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const initialSentRef = useRef(false)

  const decisions = currentProject?.architectureDecisions || []
  const chatMessages = currentProject?.architectureChatMessages || []

  // Group decisions by category
  const grouped = new Map<ArchitectureCategory, ArchitectureDecision[]>()
  for (const d of decisions) {
    const list = grouped.get(d.category) || []
    list.push(d)
    grouped.set(d.category, list)
  }

  const acceptedCount = decisions.filter((d) => d.status === 'accepted').length
  const proposedCount = decisions.filter((d) => d.status === 'proposed').length

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages.length, streamText])

  const sendMessage = useCallback(async (messageText: string, isInitial = false) => {
    if (!currentProject || streaming) return
    if (!messageText.trim() && !isInitial) return

    const userMsg: ArchitectureChatMessage = {
      id: generateId(),
      role: 'user',
      content: isInitial ? 'Analyze my project and suggest an initial architecture.' : messageText.trim(),
      timestamp: Date.now(),
    }
    addChatMessage(userMsg)
    setInput('')
    setStreaming(true)
    setStreamText('')

    try {
      const context = buildArchitectureContext(currentProject)
      const res = await authFetch('/api/ai/architecture-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          isInitial,
          context,
          chatHistory: chatMessages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) throw new Error('Request failed')

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        fullText += decoder.decode(value, { stream: true })
        // Show the MESSAGE part in real-time
        const msgMatch = fullText.match(/^MESSAGE:\s*([\s\S]*?)(?=\nDECISIONS:|$)/i)
        setStreamText(msgMatch?.[1]?.trim() || fullText.replace(/^MESSAGE:\s*/i, '').trim())
      }

      // Parse final response
      const { message: parsedMessage, decisions: parsedDecisions } = parseDecisionsFromStream(fullText)

      // Create decision objects
      const now = Date.now()
      const newDecisions: ArchitectureDecision[] = parsedDecisions.map((d) => ({
        ...d,
        id: generateId(),
        status: 'proposed' as const,
        createdAt: now,
        updatedAt: now,
      }))

      // Save assistant message with attached decisions
      const aiMsg: ArchitectureChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: parsedMessage,
        timestamp: Date.now(),
        decisions: newDecisions.length > 0 ? newDecisions : undefined,
      }
      addChatMessage(aiMsg)

      // Add decisions to store
      for (const d of newDecisions) {
        addDecision(d)
      }
    } catch (err) {
      console.error('Architecture chat error:', err)
      addChatMessage({
        id: generateId(),
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: Date.now(),
      })
    } finally {
      setStreaming(false)
      setStreamText('')
    }
  }, [currentProject, streaming, chatMessages, addChatMessage, addDecision])

  // Auto-generate on first open
  useEffect(() => {
    if (!currentProject || initialSentRef.current) return
    if (chatMessages.length > 0) return
    if (currentProject.nodes.length === 0) return
    initialSentRef.current = true
    sendMessage('', true)
  }, [currentProject, chatMessages.length, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  if (!currentProject) return null

  return (
    <div className="h-full flex">
      {/* Left: Decision Board */}
      <div className="flex-1 flex flex-col min-w-0 border-r">
        {/* Summary bar */}
        <div className="px-4 py-2.5 border-b bg-background/80 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold">Architecture</h2>
            {decisions.length > 0 && (
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>{decisions.length} decision{decisions.length !== 1 ? 's' : ''}</span>
                {acceptedCount > 0 && (
                  <span className="text-green-600">{acceptedCount} accepted</span>
                )}
                {proposedCount > 0 && (
                  <span className="text-yellow-600">{proposedCount} proposed</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Decision list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {decisions.length === 0 && !streaming ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground max-w-xs">
                <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">No architecture decisions yet</p>
                <p className="text-xs mt-1">
                  {currentProject.nodes.length > 0
                    ? 'Generating initial architecture recommendations...'
                    : 'Start a conversation to discuss your project\'s architecture'}
                </p>
              </div>
            </div>
          ) : (
            Array.from(grouped.entries())
              .sort(([a], [b]) => {
                const order: ArchitectureCategory[] = ['frontend', 'backend', 'database', 'auth', 'deployment', 'state_management', 'api_design', 'file_structure', 'testing', 'third_party', 'caching', 'other']
                return order.indexOf(a) - order.indexOf(b)
              })
              .map(([category, catDecisions]) => (
                <CategorySection
                  key={category}
                  category={category}
                  decisions={catDecisions}
                  onStatusChange={(id, status) => setDecisionStatus(id, status)}
                  onUpdate={(id, updates) => updateDecision(id, updates)}
                  onDelete={(id) => removeDecision(id)}
                />
              ))
          )}
        </div>
      </div>

      {/* Right: Chat Panel */}
      <div className="w-96 flex flex-col shrink-0">
        {/* Chat header */}
        <div className="px-4 py-2.5 border-b bg-background/80 shrink-0">
          <h3 className="text-sm font-semibold">Architecture Chat</h3>
          <p className="text-[11px] text-muted-foreground">Discuss technical decisions for your project</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.length === 0 && !streaming && (
            <div className="space-y-3 pt-8">
              <p className="text-xs text-muted-foreground text-center">
                {currentProject.nodes.length > 0
                  ? 'Loading recommendations...'
                  : 'Ask about your project\'s architecture'}
              </p>
              {currentProject.nodes.length === 0 && (
                <div className="space-y-2">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="w-full text-left text-xs px-3 py-2 rounded-lg border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {chatMessages.map((msg) => (
            <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.decisions && msg.decisions.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-foreground/10 space-y-1">
                    <p className="text-[10px] font-medium opacity-70">Proposed {msg.decisions.length} decision{msg.decisions.length !== 1 ? 's' : ''}:</p>
                    {msg.decisions.map((d) => (
                      <div key={d.id} className="text-[10px] opacity-80">
                        <span className="font-medium">{d.title}</span>
                        <span className="opacity-60"> ({CATEGORY_CONFIG[d.category]?.label || d.category})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {streaming && streamText && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed bg-muted">
                <p className="whitespace-pre-wrap">{streamText}</p>
                <Loader2 className="h-3 w-3 animate-spin mt-1 opacity-50" />
              </div>
            </div>
          )}

          {streaming && !streamText && (
            <div className="flex justify-start">
              <div className="rounded-lg px-3 py-2 bg-muted">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t shrink-0">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about architecture..."
              disabled={streaming}
              rows={1}
              className="flex-1 text-xs bg-muted rounded-lg px-3 py-2 outline-none resize-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground disabled:opacity-50"
            />
            <Button
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => sendMessage(input)}
              disabled={streaming || !input.trim()}
              title="Send"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
