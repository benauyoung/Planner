'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useProjectStore } from '@/stores/project-store'
import { useWebContainer } from '@/hooks/use-webcontainer'
import { buildAppGenerationContext } from '@/lib/build-app-context'
import { cn } from '@/lib/utils'
import {
  Sparkles,
  Loader2,
  Monitor,
  Smartphone,
  Tablet,
  RotateCcw,
  ExternalLink,
  FileCode2,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Maximize2,
  RefreshCw,
  MessageSquare,
  Send,
  X,
  MousePointerClick,
  Paintbrush,
  Type,
  Code2,
  Download,
  Plus,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authFetch } from '@/lib/auth-fetch'
import { generateId } from '@/lib/id'
import type { AppChatMessage } from '@/types/project'
import dynamic from 'next/dynamic'
import { parseAppRoutes } from '@/lib/parse-app-routes'

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then((m) => m.default), { ssr: false })

// ─── Types ───────────────────────────────────────────────────

type ViewportSize = 'desktop' | 'tablet' | 'mobile'

const VIEWPORT_SIZES: Record<ViewportSize, { width: string; label: string }> = {
  desktop: { width: '100%', label: 'Desktop' },
  tablet: { width: '768px', label: 'Tablet' },
  mobile: { width: '375px', label: 'Mobile' },
}

type GenerationPhase =
  | 'idle'
  | 'booting'
  | 'installing'
  | 'generating'
  | 'writing'
  | 'starting'
  | 'ready'
  | 'error'

interface PhaseStep {
  phase: GenerationPhase
  label: string
  description: string
}

const PHASE_STEPS: PhaseStep[] = [
  { phase: 'booting', label: 'Booting', description: 'Starting WebContainer runtime...' },
  { phase: 'installing', label: 'Installing', description: 'Installing React, Tailwind, and dependencies...' },
  { phase: 'generating', label: 'Generating', description: 'AI is building your app from the project plan...' },
  { phase: 'writing', label: 'Writing', description: 'Writing generated files...' },
  { phase: 'starting', label: 'Starting', description: 'Starting Vite dev server...' },
  { phase: 'ready', label: 'Ready', description: 'Your app is live!' },
]

// ─── Progress Indicator ──────────────────────────────────────

function PhaseProgress({ currentPhase, error }: { currentPhase: GenerationPhase; error: string | null }) {
  const currentIdx = PHASE_STEPS.findIndex((s) => s.phase === currentPhase)

  return (
    <div className="space-y-3">
      {PHASE_STEPS.map((step, i) => {
        const isActive = step.phase === currentPhase
        const isDone = currentIdx > i || currentPhase === 'ready'
        const isError = isActive && error

        return (
          <div key={step.phase} className="flex items-start gap-3">
            <div className="mt-0.5">
              {isError ? (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              ) : isDone ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : isActive ? (
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/30" />
              )}
            </div>
            <div>
              <p
                className={cn(
                  'text-sm font-medium',
                  isActive && !isError && 'text-primary',
                  isDone && 'text-foreground',
                  isError && 'text-destructive',
                  !isActive && !isDone && 'text-muted-foreground/50'
                )}
              >
                {step.label}
              </p>
              {isActive && (
                <p className={cn('text-xs mt-0.5', isError ? 'text-destructive/80' : 'text-muted-foreground')}>
                  {isError ? error : step.description}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── File Tree Sidebar ───────────────────────────────────────

function FileTree({ files }: { files: { path: string; content: string }[] }) {
  const [expanded, setExpanded] = useState(true)

  // Group files by directory
  const tree = new Map<string, string[]>()
  for (const f of files) {
    const parts = f.path.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    if (!tree.has(dir)) tree.set(dir, [])
    tree.get(dir)!.push(parts[parts.length - 1])
  }

  return (
    <div className="text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 w-full px-2 py-1.5 text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        <FileCode2 className="h-3 w-3" />
        <span className="font-medium">Files ({files.length})</span>
      </button>
      {expanded && (
        <div className="pl-2">
          {Array.from(tree.entries()).map(([dir, fileNames]) => (
            <div key={dir}>
              {dir !== '.' && (
                <div className="px-2 py-0.5 text-muted-foreground/60 font-mono">{dir}/</div>
              )}
              {fileNames.map((name) => (
                <div
                  key={`${dir}/${name}`}
                  className="px-4 py-0.5 font-mono text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded cursor-default truncate"
                  title={dir === '.' ? name : `${dir}/${name}`}
                >
                  {name}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── App Chat Sidebar ────────────────────────────────────────

function AppChat({
  appFiles,
  onFilesUpdated,
  onClose,
}: {
  appFiles: { path: string; content: string }[]
  onFilesUpdated: (updatedFiles: { path: string; content: string }[], summary: string) => void
  onClose: () => void
}) {
  const currentProject = useProjectStore((s) => s.currentProject)
  const addAppChatMessage = useProjectStore((s) => s.addAppChatMessage)
  const savedMessages = currentProject?.appChatMessages || []

  const [messages, setMessages] = useState<AppChatMessage[]>(savedMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  // Sync saved messages on mount
  useEffect(() => {
    if (savedMessages.length > 0 && messages.length === 0) {
      setMessages(savedMessages)
    }
  }, [])

  const handleSend = async () => {
    const instruction = input.trim()
    if (!instruction || loading) return

    setInput('')

    const userMsg: AppChatMessage = {
      id: generateId(),
      role: 'user',
      content: instruction,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMsg])
    addAppChatMessage(userMsg)
    setLoading(true)

    try {
      const res = await authFetch('/api/ai/edit-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: appFiles,
          instruction,
        }),
      })

      if (!res.ok) throw new Error('Failed to edit app')

      const data = await res.json()
      const updatedFiles: { path: string; content: string }[] = data.files || []
      const summary: string = data.summary || 'Updated!'

      const aiMsg: AppChatMessage = {
        id: generateId(),
        role: 'ai',
        content: summary,
        filesChanged: updatedFiles.map((f) => f.path),
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, aiMsg])
      addAppChatMessage(aiMsg)

      if (updatedFiles.length > 0) {
        onFilesUpdated(updatedFiles, summary)
      }
    } catch (err) {
      const errMsg: AppChatMessage = {
        id: generateId(),
        role: 'ai',
        content: 'Failed to update. Try again.',
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errMsg])
      addAppChatMessage(errMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-80 border-l bg-background flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0">
        <MessageSquare className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold flex-1">Edit with AI</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <div className="text-xs text-muted-foreground text-center pt-8">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
            <p className="font-medium mb-1">Edit your app with AI</p>
            <p>Describe what you want to change and the preview will update live.</p>
            <div className="mt-4 space-y-1.5 text-left">
              <p className="italic text-muted-foreground/60">&quot;Make the header blue&quot;</p>
              <p className="italic text-muted-foreground/60">&quot;Add a pricing section&quot;</p>
              <p className="italic text-muted-foreground/60">&quot;Add a dark mode toggle&quot;</p>
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id}>
            <div
              className={cn(
                'text-xs rounded-lg px-3 py-2 max-w-[90%]',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground ml-auto'
                  : 'bg-muted text-foreground'
              )}
            >
              {msg.content}
            </div>
            {msg.role === 'ai' && msg.filesChanged && msg.filesChanged.length > 0 && (
              <div className="mt-1 ml-1">
                {msg.filesChanged.map((f) => (
                  <span key={f} className="inline-block text-[10px] font-mono text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5 mr-1 mb-0.5">
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Updating app...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-2 shrink-0">
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe changes..."
            className="flex-1 h-8 px-3 text-xs bg-muted rounded-md border-0 outline-none focus:ring-1 focus:ring-primary"
            disabled={loading}
          />
          <Button
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleSend}
            disabled={!input.trim() || loading}
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Element Inspector Panel ─────────────────────────────────

interface SelectedElement {
  tag: string
  text: string | null
  className: string
  id: string | null
  styles: {
    color: string
    backgroundColor: string
    fontSize: string
    fontWeight: string
    padding: string
    margin: string
    borderRadius: string
    width: string
    height: string
    display: string
  }
  rect: { x: number; y: number; width: number; height: number }
  path: string
}

function ElementInspector({
  element,
  onEditRequest,
  onClose,
}: {
  element: SelectedElement
  onEditRequest: (instruction: string) => void
  onClose: () => void
}) {
  const [editingText, setEditingText] = useState(false)
  const [newText, setNewText] = useState(element.text || '')
  const [editingColor, setEditingColor] = useState(false)
  const [newColor, setNewColor] = useState('')

  // Reset when element changes
  useEffect(() => {
    setEditingText(false)
    setNewText(element.text || '')
    setEditingColor(false)
    setNewColor('')
  }, [element.path])

  const handleTextSubmit = () => {
    if (newText && newText !== element.text) {
      onEditRequest(`Change the text "${element.text}" to "${newText}" in the ${element.path} element`)
    }
    setEditingText(false)
  }

  const handleColorSubmit = () => {
    if (newColor) {
      onEditRequest(`Change the background color of the ${element.path} element to ${newColor}`)
    }
    setEditingColor(false)
  }

  const quickActions = [
    { label: 'Make larger', action: `Make the ${element.path} element larger (increase font size and padding)` },
    { label: 'Make smaller', action: `Make the ${element.path} element smaller (decrease font size and padding)` },
    { label: 'Make bold', action: `Make the text in ${element.path} bold` },
    { label: 'Center', action: `Center the ${element.path} element` },
    { label: 'Add shadow', action: `Add a subtle shadow to the ${element.path} element` },
    { label: 'Round corners', action: `Add rounded corners to the ${element.path} element` },
  ]

  return (
    <div className="w-72 border-l bg-background flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0">
        <MousePointerClick className="h-3.5 w-3.5 text-purple-500" />
        <span className="text-xs font-semibold flex-1 truncate">
          &lt;{element.tag}&gt;
          {element.id && <span className="text-muted-foreground">#{element.id}</span>}
        </span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Element path */}
        <div className="px-3 py-2 border-b">
          <p className="text-[10px] font-mono text-muted-foreground truncate" title={element.path}>
            {element.path}
          </p>
        </div>

        {/* Text content */}
        {element.text && (
          <div className="px-3 py-2 border-b">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Type className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Text</span>
            </div>
            {editingText ? (
              <div className="space-y-1.5">
                <input
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                  className="w-full h-7 px-2 text-xs bg-muted rounded border-0 outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
                <div className="flex gap-1">
                  <Button size="sm" className="h-6 text-[10px] flex-1" onClick={handleTextSubmit}>Apply</Button>
                  <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setEditingText(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setEditingText(true)}
                className="text-xs text-foreground hover:bg-accent/50 rounded px-1.5 py-1 -mx-1.5 w-full text-left truncate transition-colors"
                title={element.text}
              >
                {element.text}
              </button>
            )}
          </div>
        )}

        {/* Colors */}
        <div className="px-3 py-2 border-b">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Paintbrush className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Colors</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border" style={{ backgroundColor: element.styles.color }} />
              <span className="text-[10px] font-mono text-muted-foreground">text: {element.styles.color}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border" style={{ backgroundColor: element.styles.backgroundColor }} />
              <span className="text-[10px] font-mono text-muted-foreground">bg: {element.styles.backgroundColor}</span>
            </div>
          </div>
          {editingColor ? (
            <div className="mt-2 space-y-1.5">
              <input
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleColorSubmit()}
                placeholder="e.g. blue, #3b82f6, red-500"
                className="w-full h-7 px-2 text-xs bg-muted rounded border-0 outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
              <div className="flex gap-1">
                <Button size="sm" className="h-6 text-[10px] flex-1" onClick={handleColorSubmit}>Apply</Button>
                <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setEditingColor(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditingColor(true)}
              className="text-[10px] text-primary hover:underline mt-1.5 block"
            >
              Change color...
            </button>
          )}
        </div>

        {/* Computed styles */}
        <div className="px-3 py-2 border-b">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Layout</span>
          <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5">
            {[
              ['size', `${element.styles.width} × ${element.styles.height}`],
              ['font', element.styles.fontSize],
              ['weight', element.styles.fontWeight],
              ['padding', element.styles.padding],
              ['margin', element.styles.margin],
              ['radius', element.styles.borderRadius],
              ['display', element.styles.display],
            ].map(([label, value]) => (
              <div key={label} className="flex items-baseline gap-1">
                <span className="text-[10px] text-muted-foreground/60 shrink-0">{label}:</span>
                <span className="text-[10px] font-mono text-muted-foreground truncate">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="px-3 py-2">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Quick Actions</span>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {quickActions.map((qa) => (
              <button
                key={qa.label}
                onClick={() => onEditRequest(qa.action)}
                className="text-[10px] px-2 py-1 rounded-full border bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {qa.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Code Editor Panel ───────────────────────────────────────

function CodeEditorPanel({
  files,
  onFileChange,
  onClose,
}: {
  files: { path: string; content: string }[]
  onFileChange: (path: string, content: string) => void
  onClose: () => void
}) {
  const [activeFile, setActiveFile] = useState(files[0]?.path || '')
  const activeContent = files.find((f) => f.path === activeFile)?.content || ''

  // Sort files: App.tsx first, then pages, then components, then rest
  const sortedFiles = [...files].sort((a, b) => {
    if (a.path.includes('App.tsx')) return -1
    if (b.path.includes('App.tsx')) return 1
    if (a.path.includes('pages/') && !b.path.includes('pages/')) return -1
    if (!a.path.includes('pages/') && b.path.includes('pages/')) return 1
    return a.path.localeCompare(b.path)
  })

  const getFileName = (path: string) => {
    const parts = path.split('/')
    return parts[parts.length - 1]
  }

  return (
    <div className="flex flex-col h-full border-l bg-background" style={{ width: '50%', minWidth: 400 }}>
      {/* File tabs */}
      <div className="flex items-center border-b shrink-0 overflow-x-auto">
        <div className="flex items-center flex-1 min-w-0">
          {sortedFiles.map((f) => (
            <button
              key={f.path}
              onClick={() => setActiveFile(f.path)}
              className={cn(
                'px-3 py-1.5 text-xs font-mono border-r shrink-0 transition-colors',
                activeFile === f.path
                  ? 'bg-background text-foreground border-b-2 border-b-primary'
                  : 'bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
              title={f.path}
            >
              {getFileName(f.path)}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="px-2 py-1.5 text-muted-foreground hover:text-foreground shrink-0">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <MonacoEditor
          height="100%"
          language="typescript"
          theme="vs-dark"
          value={activeContent}
          onChange={(value) => {
            if (value !== undefined) {
              onFileChange(activeFile, value)
            }
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            automaticLayout: true,
            padding: { top: 8 },
          }}
        />
      </div>

      {/* Status bar */}
      <div className="flex items-center px-3 py-1 border-t bg-muted/30 text-[10px] text-muted-foreground">
        <span className="font-mono">{activeFile}</span>
        <span className="mx-2">•</span>
        <span>TypeScript JSX</span>
      </div>
    </div>
  )
}

// ─── Main Design View ────────────────────────────────────────

export function DesignView() {
  const currentProject = useProjectStore((s) => s.currentProject)
  const setAppFiles = useProjectStore((s) => s.setAppFiles)
  const addAppChatMessage = useProjectStore((s) => s.addAppChatMessage)

  const {
    status: wcStatus,
    error: wcError,
    serverUrl,
    supported,
    boot,
    writeAppFiles,
    restart,
  } = useWebContainer()

  const [phase, setPhase] = useState<GenerationPhase>('idle')
  const [genError, setGenError] = useState<string | null>(null)
  const [viewport, setViewport] = useState<ViewportSize>('desktop')
  const [appFiles, setLocalAppFiles] = useState<{ path: string; content: string }[]>([])
  const [summary, setSummary] = useState<string | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [selectorEnabled, setSelectorEnabled] = useState(false)
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null)
  const [codeEditorOpen, setCodeEditorOpen] = useState(false)
  const [currentRoute, setCurrentRoute] = useState('/')
  const [addPageOpen, setAddPageOpen] = useState(false)
  const [addPageName, setAddPageName] = useState('')
  const [addingPage, setAddingPage] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const routes = useMemo(() => parseAppRoutes(appFiles), [appFiles])

  // Listen for postMessage from iframe (element selector + route changes)
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === 'tb-element-selected') {
        setSelectedElement(e.data.element as SelectedElement)
      }
      if (e.data?.type === 'tb-route-change' && typeof e.data.path === 'string') {
        setCurrentRoute(e.data.path)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Toggle selector in iframe
  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return
    iframeRef.current.contentWindow.postMessage(
      { type: selectorEnabled ? 'tb-selector-enable' : 'tb-selector-disable' },
      '*'
    )
  }, [selectorEnabled, serverUrl])

  // Sync WebContainer status to our phase
  useEffect(() => {
    if (wcStatus === 'booting') setPhase('booting')
    else if (wcStatus === 'installing') setPhase('installing')
    else if (wcStatus === 'starting') setPhase('starting')
    else if (wcStatus === 'ready' && phase === 'starting') setPhase('ready')
    else if (wcStatus === 'error') {
      setPhase('error')
      setGenError(wcError)
    }
  }, [wcStatus, wcError, phase])

  // Load existing app files from project
  useEffect(() => {
    if (currentProject?.appFiles && currentProject.appFiles.length > 0) {
      setLocalAppFiles(currentProject.appFiles)
      if (currentProject.appDesignSummary) setSummary(currentProject.appDesignSummary)
    }
  }, [currentProject?.appFiles, currentProject?.appDesignSummary])

  const handleGenerate = useCallback(async () => {
    if (!currentProject) {
      console.warn('[DesignView] handleGenerate: no currentProject, aborting')
      return
    }

    console.log('[DesignView] handleGenerate: starting, project =', currentProject.title)
    setGenError(null)
    setPhase('booting')

    try {
      // Step 1-3: Boot WebContainer + install deps + start server
      console.log('[DesignView] Booting WebContainer...')
      await boot()
      console.log('[DesignView] WebContainer booted successfully')

      // Step 4: Generate app via AI
      setPhase('generating')
      console.log('[DesignView] Generating app via AI...')
      const context = buildAppGenerationContext(currentProject)

      const res = await authFetch('/api/ai/generate-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to generate app')
      }

      const data = await res.json()
      const files: { path: string; content: string }[] = data.files || []

      if (files.length === 0) {
        throw new Error('AI returned no files')
      }

      // Step 5: Write files to WebContainer
      setPhase('writing')
      await writeAppFiles(files)

      // Save to project store
      setLocalAppFiles(files)
      setSummary(data.summary || null)
      setAppFiles(files, data.summary)

      // The server should already be running and will hot-reload
      setPhase('ready')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setGenError(msg)
      setPhase('error')
      console.error('Generate app error:', err)
    }
  }, [currentProject, boot, writeAppFiles, setAppFiles])

  const handleRegenerate = useCallback(async () => {
    setLocalAppFiles([])
    setSummary(null)
    await handleGenerate()
  }, [handleGenerate])

  const handleChatFilesUpdated = useCallback(
    async (updatedFiles: { path: string; content: string }[], _summary: string) => {
      // Merge updated files into local state
      const merged = [...appFiles]
      for (const uf of updatedFiles) {
        const idx = merged.findIndex((f) => f.path === uf.path)
        if (idx >= 0) {
          merged[idx] = uf
        } else {
          merged.push(uf)
        }
      }
      setLocalAppFiles(merged)
      setAppFiles(merged)

      // Write to WebContainer for hot reload
      try {
        await writeAppFiles(updatedFiles)
      } catch (err) {
        console.error('Failed to write updated files to WebContainer:', err)
      }
    },
    [appFiles, writeAppFiles, setAppFiles]
  )

  const handleInspectorEditRequest = useCallback(
    async (instruction: string) => {
      // Send the edit through the same AI pipeline as chat
      try {
        const res = await authFetch('/api/ai/edit-app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ files: appFiles, instruction }),
        })

        if (!res.ok) throw new Error('Failed to edit app')

        const data = await res.json()
        const updatedFiles: { path: string; content: string }[] = data.files || []

        if (updatedFiles.length > 0) {
          await handleChatFilesUpdated(updatedFiles, data.summary || 'Visual edit applied')
        }
      } catch (err) {
        console.error('Inspector edit failed:', err)
      }
    },
    [appFiles, handleChatFilesUpdated]
  )

  const handleCloseInspector = useCallback(() => {
    setSelectedElement(null)
    setSelectorEnabled(false)
  }, [])

  const handleCodeFileChange = useCallback(
    async (path: string, content: string) => {
      // Update local state
      const updated = appFiles.map((f) => f.path === path ? { ...f, content } : f)
      setLocalAppFiles(updated)
      setAppFiles(updated)

      // Write to WebContainer for hot reload
      try {
        await writeAppFiles([{ path, content }])
      } catch (err) {
        console.error('Failed to write code change to WebContainer:', err)
      }
    },
    [appFiles, writeAppFiles, setAppFiles]
  )

  const handleExportZip = useCallback(async () => {
    if (appFiles.length === 0) return

    // Dynamic import JSZip only when needed
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()

    for (const file of appFiles) {
      zip.file(file.path, file.content)
    }

    // Add the template config files too
    zip.file('package.json', JSON.stringify({
      name: 'tinybaguette-export',
      private: true,
      type: 'module',
      scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
      dependencies: {
        react: '^18.3.1',
        'react-dom': '^18.3.1',
        'react-router-dom': '^6.28.0',
        'lucide-react': '^0.468.0',
      },
      devDependencies: {
        '@vitejs/plugin-react': '^4.3.4',
        tailwindcss: '^4.0.0',
        '@tailwindcss/vite': '^4.0.0',
        vite: '^6.0.0',
      },
    }, null, 2))

    zip.file('vite.config.js', `import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\nimport tailwindcss from '@tailwindcss/vite'\n\nexport default defineConfig({\n  plugins: [react(), tailwindcss()],\n})\n`)

    zip.file('index.html', `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>App</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>\n`)

    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentProject?.title || 'app'}-export.zip`
    a.click()
    URL.revokeObjectURL(url)
  }, [appFiles, currentProject?.title])

  const handleReloadPreview = useCallback(() => {
    if (iframeRef.current && serverUrl) {
      iframeRef.current.src = serverUrl
    }
  }, [serverUrl])

  const handleOpenExternal = useCallback(() => {
    if (serverUrl) {
      window.open(serverUrl, '_blank')
    }
  }, [serverUrl])

  // ─── Load existing app files into WebContainer on revisit ──
  const handleLoadExisting = useCallback(async () => {
    if (!currentProject?.appFiles || currentProject.appFiles.length === 0) return

    setGenError(null)
    setPhase('booting')

    try {
      await boot()
      setPhase('writing')
      await writeAppFiles(currentProject.appFiles)
      setLocalAppFiles(currentProject.appFiles)
      if (currentProject.appDesignSummary) setSummary(currentProject.appDesignSummary)
      setPhase('ready')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load existing app'
      setGenError(msg)
      setPhase('error')
    }
  }, [currentProject, boot, writeAppFiles])

  const handleNavigateRoute = useCallback(
    (path: string) => {
      if (!iframeRef.current?.contentWindow) return
      iframeRef.current.contentWindow.postMessage(
        { type: 'tb-navigate', path },
        '*'
      )
    },
    []
  )

  const handleAddPage = useCallback(
    async () => {
      if (!addPageName.trim() || addingPage) return
      setAddingPage(true)

      const pageName = addPageName.trim()
      const slug = pageName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      const routePath = `/${slug}`

      try {
        const instruction = `Add a new page called "${pageName}" at route "${routePath}". Create the page component at src/pages/${pageName.replace(/\s+/g, '')}.tsx with a full, polished UI that fits the existing app's design system. Update src/App.tsx to import the new page and add a <Route path="${routePath}"> for it. If the app has a navigation/header component, add a link to "${pageName}" there too.`

        const res = await authFetch('/api/ai/edit-app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ files: appFiles, instruction }),
        })

        if (!res.ok) throw new Error('Failed to add page')

        const data = await res.json()
        const updatedFiles: { path: string; content: string }[] = data.files || []

        if (updatedFiles.length > 0) {
          await handleChatFilesUpdated(updatedFiles, data.summary || `Added ${pageName} page`)

          const msg: AppChatMessage = {
            id: generateId(),
            role: 'ai',
            content: `Added new page: **${pageName}** at \`${routePath}\``,
            filesChanged: updatedFiles.map((f) => f.path),
            timestamp: Date.now(),
          }
          addAppChatMessage(msg)
        }

        setAddPageOpen(false)
        setAddPageName('')

        // Navigate to the new page after a short delay for hot reload
        setTimeout(() => handleNavigateRoute(routePath), 1000)
      } catch (err) {
        console.error('Failed to add page:', err)
      } finally {
        setAddingPage(false)
      }
    },
    [addPageName, addingPage, appFiles, handleChatFilesUpdated, addAppChatMessage, handleNavigateRoute]
  )

  // ─── Browser Not Supported ─────────────────────────────────
  if (!supported) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Browser Not Supported</h3>
          <p className="text-sm text-muted-foreground">
            The Design tab requires a modern browser with SharedArrayBuffer support.
            Please use the latest version of Chrome, Edge, or Firefox.
          </p>
        </div>
      </div>
    )
  }

  // ─── Empty / Idle State ─────────────────────────────────────
  const hasSavedFiles = currentProject?.appFiles && currentProject.appFiles.length > 0
  if (phase === 'idle' && appFiles.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-lg">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Monitor className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-3">Design Your App</h3>
          {!currentProject ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Loading project data...</p>
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-2 max-w-md mx-auto">
                {hasSavedFiles
                  ? 'You have a previously generated app. Load the preview or regenerate from scratch.'
                  : 'Generate a complete React + Tailwind application from your project plan. The AI will read your goals, features, and PRDs to build a fully functional preview.'}
              </p>
              {!hasSavedFiles && currentProject.nodes.length === 0 && (
                <p className="text-xs text-amber-500 mb-4">
                  Tip: Add some goals and features in the Plan tab first for better results.
                </p>
              )}
              <div className="flex items-center justify-center gap-3 mt-4">
                {hasSavedFiles && (
                  <Button onClick={handleLoadExisting} size="lg" className="gap-2">
                    <Monitor className="h-5 w-5" />
                    Load Preview
                  </Button>
                )}
                <Button onClick={handleGenerate} size="lg" variant={hasSavedFiles ? 'outline' : 'default'} className="gap-2">
                  <Sparkles className="h-5 w-5" />
                  {hasSavedFiles ? 'Regenerate' : 'Generate App'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                This may take 30-60 seconds on first run (installing dependencies).
              </p>
            </>
          )}
        </div>
      </div>
    )
  }

  // ─── Loading / Generating State ─────────────────────────────
  if (phase !== 'idle' && phase !== 'ready' && phase !== 'error' && appFiles.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="max-w-sm">
          <h3 className="text-lg font-semibold mb-6">Building your app...</h3>
          <PhaseProgress currentPhase={phase} error={genError} />
        </div>
      </div>
    )
  }

  // ─── Error State ────────────────────────────────────────────
  if (phase === 'error' && appFiles.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Generation Failed</h3>
          <p className="text-sm text-muted-foreground mb-4">{genError}</p>
          <div className="flex items-center justify-center gap-2">
            <Button onClick={handleGenerate} variant="default" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Retry
            </Button>
            <Button onClick={restart} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reset Container
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Ready State — Preview + Sidebar ────────────────────────
  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-background/90 backdrop-blur-sm shrink-0">
        {/* Viewport switcher */}
        <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
          {([
            { size: 'desktop' as ViewportSize, icon: Monitor },
            { size: 'tablet' as ViewportSize, icon: Tablet },
            { size: 'mobile' as ViewportSize, icon: Smartphone },
          ]).map(({ size, icon: Icon }) => (
            <button
              key={size}
              onClick={() => setViewport(size)}
              className={cn(
                'p-1.5 rounded transition-colors',
                viewport === size
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title={VIEWPORT_SIZES[size].label}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Page navigator */}
        {routes.length > 0 && phase === 'ready' && (
          <div className="relative flex items-center gap-1">
            <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <select
              value={currentRoute}
              onChange={(e) => handleNavigateRoute(e.target.value)}
              className="h-7 text-xs bg-transparent border rounded-md px-2 pr-6 appearance-none cursor-pointer hover:bg-muted transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {routes.map((r) => (
                <option key={r.path} value={r.path}>
                  {r.label} ({r.path})
                </option>
              ))}
            </select>
            <button
              onClick={() => setAddPageOpen(true)}
              className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Add a new page"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {routes.length > 0 && phase === 'ready' && (
          <div className="w-px h-5 bg-border" />
        )}

        {/* Actions */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={handleRegenerate}
          disabled={phase !== 'ready' && phase !== 'idle' && phase !== 'error'}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Regenerate
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={handleReloadPreview}
          disabled={!serverUrl}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reload
        </Button>

        <div className="flex-1" />

        {/* Status indicator */}
        {phase === 'ready' && (
          <div className="flex items-center gap-1.5 text-xs text-green-600">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </div>
        )}

        {phase !== 'ready' && phase !== 'idle' && phase !== 'error' && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            {PHASE_STEPS.find((s) => s.phase === phase)?.label || 'Working...'}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className={cn('h-7 gap-1.5 text-xs', selectorEnabled && 'bg-purple-500/10 text-purple-600')}
          onClick={() => {
            const next = !selectorEnabled
            setSelectorEnabled(next)
            if (!next) setSelectedElement(null)
          }}
          disabled={phase !== 'ready'}
          title="Click elements in the preview to inspect and edit them"
        >
          <MousePointerClick className="h-3.5 w-3.5" />
          Select
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn('h-7 gap-1.5 text-xs', chatOpen && 'bg-accent')}
          onClick={() => setChatOpen(!chatOpen)}
          disabled={phase !== 'ready'}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Chat
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn('h-7 gap-1.5 text-xs', codeEditorOpen && 'bg-accent')}
          onClick={() => setCodeEditorOpen(!codeEditorOpen)}
          disabled={phase !== 'ready' || appFiles.length === 0}
        >
          <Code2 className="h-3.5 w-3.5" />
          Code
        </Button>

        <div className="w-px h-5 bg-border" />

        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={handleExportZip}
          disabled={appFiles.length === 0}
          title="Download app as zip"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleOpenExternal}
          disabled={!serverUrl}
          title="Open in new tab"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <div className="w-56 border-r bg-muted/30 flex flex-col shrink-0 overflow-y-auto">
          {/* Summary */}
          {summary && (
            <div className="p-3 border-b">
              <p className="text-xs text-muted-foreground leading-relaxed">{summary}</p>
            </div>
          )}

          {/* File tree */}
          <div className="py-2">
            <FileTree files={appFiles} />
          </div>

          {/* Generation progress (when regenerating) */}
          {phase !== 'ready' && phase !== 'idle' && (
            <div className="p-3 border-t mt-auto">
              <PhaseProgress currentPhase={phase} error={genError} />
            </div>
          )}
        </div>

        {/* Preview iframe */}
        <div className="flex-1 bg-muted/20 flex items-start justify-center p-4 overflow-auto">
          <div
            className={cn(
              'bg-background border rounded-lg shadow-lg overflow-hidden transition-all duration-300',
              viewport === 'desktop' && 'w-full h-full',
              viewport !== 'desktop' && 'h-[90%]'
            )}
            style={{
              width: viewport !== 'desktop' ? VIEWPORT_SIZES[viewport].width : undefined,
              maxWidth: '100%',
            }}
          >
            {serverUrl ? (
              <iframe
                ref={iframeRef}
                src={serverUrl}
                title="App Preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
                  <p className="text-sm">Starting preview server...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Code editor */}
        {codeEditorOpen && !chatOpen && (
          <CodeEditorPanel
            files={appFiles}
            onFileChange={handleCodeFileChange}
            onClose={() => setCodeEditorOpen(false)}
          />
        )}

        {/* Element inspector */}
        {selectedElement && !chatOpen && !codeEditorOpen && (
          <ElementInspector
            element={selectedElement}
            onEditRequest={handleInspectorEditRequest}
            onClose={handleCloseInspector}
          />
        )}

        {/* Chat sidebar */}
        {chatOpen && (
          <AppChat
            appFiles={appFiles}
            onFilesUpdated={handleChatFilesUpdated}
            onClose={() => setChatOpen(false)}
          />
        )}
      </div>

      {/* Add Page dialog */}
      {addPageOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-background border rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-sm font-semibold mb-3">Add New Page</h3>
            <input
              type="text"
              value={addPageName}
              onChange={(e) => setAddPageName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPage()}
              placeholder="e.g. Pricing, About, Settings"
              className="w-full h-9 px-3 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
              disabled={addingPage}
            />
            <p className="text-[11px] text-muted-foreground mt-1.5 mb-4">
              AI will generate the page, add it to your routes, and update the navigation.
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setAddPageOpen(false); setAddPageName('') }}
                disabled={addingPage}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddPage}
                disabled={!addPageName.trim() || addingPage}
                className="gap-1.5"
              >
                {addingPage ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    Add Page
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
