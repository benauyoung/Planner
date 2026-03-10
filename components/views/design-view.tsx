'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useProjectStore } from '@/stores/project-store'
import { cn } from '@/lib/utils'
import {
  Sparkles,
  Loader2,
  Monitor,
  Smartphone,
  Tablet,
  RotateCcw,
  AlertTriangle,
  RefreshCw,
  MessageSquare,
  Send,
  X,
  Plus,
  Globe,
  LayoutGrid,
  AppWindow,
  Wand2,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authFetch } from '@/lib/auth-fetch'
import { generateId } from '@/lib/id'
import type { ProjectPage, PageEdge, AppChatMessage } from '@/types/project'
import type { Agent } from '@/types/agent'
import { DesignCanvas } from './design-canvas'
import { injectGeneratedImages, extractImagePlaceholders, POKOPIA_IMAGE_PLACEHOLDER_CSS } from '@/lib/inject-images'

// ─── Types ───────────────────────────────────────────────────

type ViewportSize = 'desktop' | 'tablet' | 'mobile'

const VIEWPORT_SIZES: Record<ViewportSize, { width: string; label: string }> = {
  desktop: { width: '100%', label: 'Desktop' },
  tablet: { width: '768px', label: 'Tablet' },
  mobile: { width: '375px', label: 'Mobile' },
}

type DesignPhase = 'idle' | 'generating' | 'ready' | 'error'

// ─── Wrap page HTML in a full document with Tailwind CDN ─────

function wrapHtmlPage(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
    ${POKOPIA_IMAGE_PLACEHOLDER_CSS}
  </style>
</head>
<body>${bodyHtml}</body>
</html>`
}

// ─── Page Chat Sidebar ──────────────────────────────────────

type ChatMsg = AppChatMessage & { followUps?: string[] }

const QUICK_ACTIONS = [
  'Make it dark mode',
  'Add a pricing section',
  'Add a contact form',
  'Make the header sticky',
  'Add social proof',
  'Improve the hero',
]

function PageChat({
  page,
  onPageUpdated,
  onClose,
  onLoadingChange,
  designSystem,
  allPageTitles,
  projectDescription,
  projectNodes,
}: {
  page: ProjectPage
  onPageUpdated: (pageId: string, newHtml: string) => void
  onClose: () => void
  onLoadingChange?: (loading: boolean) => void
  designSystem?: string | null
  allPageTitles?: string[]
  projectDescription?: string
  projectNodes?: { type: string; title: string; description?: string }[]
}) {
  const addAppChatMessage = useProjectStore((s) => s.addAppChatMessage)
  const undoPageHtml = useProjectStore((s) => s.undoPageHtml)

  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const canUndo = (page.htmlHistory?.length ?? 0) > 0

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleSend = async (instruction?: string) => {
    const text = (instruction ?? input).trim()
    if (!text || loading) return
    setInput('')

    const userMsg: ChatMsg = { id: generateId(), role: 'user', content: text, timestamp: Date.now() }
    setMessages((prev) => [...prev, userMsg])
    addAppChatMessage(userMsg)
    setLoading(true)
    onLoadingChange?.(true)

    // Placeholder message updated in real-time as stream arrives
    const aiMsgId = generateId()
    setMessages((prev) => [...prev, { id: aiMsgId, role: 'ai', content: '', timestamp: Date.now() }])

    try {
      const res = await authFetch('/api/ai/edit-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentHtml: page.html,
          instruction: text,
          pageTitle: page.title,
          pageRoute: page.route,
          designSystem: designSystem ?? undefined,
          allPageTitles: allPageTitles ?? [],
          projectDescription: projectDescription ?? undefined,
          projectNodes: projectNodes ?? [],
        }),
      })

      if (!res.ok || !res.body) throw new Error('Failed to edit page')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value, { stream: true })

        // Stream the summary into the chat message in real time
        const htmlIdx = fullText.indexOf('\nHTML:\n')
        const preHtml = htmlIdx !== -1 ? fullText.slice(0, htmlIdx) : fullText
        const streamingSummary = preHtml.match(/^SUMMARY:\s*(.+)/m)?.[1]?.trim() ?? ''
        if (streamingSummary) {
          setMessages((prev) => prev.map((m) => m.id === aiMsgId ? { ...m, content: streamingSummary } : m))
        }
      }

      // Parse complete response
      const summary = fullText.match(/^SUMMARY:\s*(.+)/m)?.[1]?.trim() ?? 'Page updated.'
      const suggestionsRaw = fullText.match(/^SUGGESTIONS:\s*(.+)/m)?.[1] ?? ''
      const suggestions = suggestionsRaw.split('|').map((s) => s.trim()).filter(Boolean)
      const htmlMatch = fullText.match(/\nHTML:\n([\s\S]+)$/)
      const html = htmlMatch?.[1]?.trim() ?? ''

      setMessages((prev) =>
        prev.map((m) => m.id === aiMsgId ? { ...m, content: summary, followUps: suggestions } : m)
      )
      addAppChatMessage({ id: aiMsgId, role: 'ai', content: summary, timestamp: Date.now() })

      if (html) {
        // Show page immediately, then inject generated images progressively
        onPageUpdated(page.id, html)

        if (extractImagePlaceholders(html).length > 0) {
          injectGeneratedImages(html, authFetch).then((enrichedHtml) => {
            if (enrichedHtml !== html) {
              onPageUpdated(page.id, enrichedHtml)
            }
          }).catch(() => { /* images failed, page still works without them */ })
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) => m.id === aiMsgId ? { ...m, content: 'Something went wrong. Try again.' } : m)
      )
    } finally {
      setLoading(false)
      onLoadingChange?.(false)
    }
  }

  return (
    <div className="w-80 border-l bg-background flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <Wand2 className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold leading-none">Baguette</div>
            <div className="text-[10px] text-muted-foreground truncate mt-0.5">{page.title}</div>
          </div>
        </div>
        {canUndo && (
          <button
            onClick={() => undoPageHtml(page.id)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted"
            title="Undo last change"
            aria-label="Undo last edit"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="pt-4">
            <div className="flex items-start gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Wand2 className="h-3 w-3 text-primary" />
              </div>
              <div className="bg-muted rounded-xl rounded-tl-none px-3 py-2 text-xs text-foreground">
                Hi! I&apos;m Baguette. Tell me what to change on this page and I&apos;ll update it instantly.
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  onClick={() => handleSend(action)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted/60 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-border/50"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isStreamingThis = loading && idx === messages.length - 1 && msg.role === 'ai'
          const isFinished = msg.role === 'ai' && !isStreamingThis && msg.content !== ''
          return (
            <div key={msg.id} className={cn('flex items-end gap-2', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
              {msg.role === 'ai' && (
                <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mb-0.5">
                  <Wand2 className="h-3 w-3 text-primary" />
                </div>
              )}
              <div className="flex flex-col gap-1.5 max-w-[85%]">
                <div className={cn(
                  'text-xs rounded-xl px-3 py-2',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                )}>
                  {/* Dots while waiting for first content; streaming text once it arrives */}
                  {isStreamingThis && msg.content === '' ? (
                    <span className="flex items-center gap-1 py-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
                    </span>
                  ) : (
                    <span>
                      {msg.content}
                      {isStreamingThis && <span className="inline-block w-0.5 h-3 bg-foreground/60 ml-0.5 animate-pulse align-middle" />}
                    </span>
                  )}
                </div>
                {isFinished && (
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                      <Check className="h-2.5 w-2.5 text-green-500" />
                      <span className="text-[10px] font-medium text-green-600 dark:text-green-400">Page updated</span>
                    </div>
                  </div>
                )}
                {isFinished && msg.followUps && msg.followUps.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {msg.followUps.map((f) => (
                      <button
                        key={f}
                        onClick={() => handleSend(f)}
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted/60 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-border/50"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Input */}
      <div className="border-t p-2.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tell Baguette what to change..."
            className="flex-1 h-8 px-3 text-xs bg-muted rounded-lg border-0 outline-none focus:ring-1 focus:ring-primary"
            aria-label="Chat message for design edits"
            disabled={loading}
          />
          <Button size="icon" className="h-8 w-8 shrink-0" onClick={() => handleSend()} disabled={!input.trim() || loading} aria-label="Send message">
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Design View ────────────────────────────────────────

export function DesignView() {
  const currentProject = useProjectStore((s) => s.currentProject)
  const setPages = useProjectStore((s) => s.setPages)
  const updatePageHtml = useProjectStore((s) => s.updatePageHtml)
  const removePage = useProjectStore((s) => s.removePage)

  const [phase, setPhase] = useState<DesignPhase>('idle')
  const [genError, setGenError] = useState<string | null>(null)
  const [isPageUpdating, setIsPageUpdating] = useState(false)
  const [viewport, setViewport] = useState<ViewportSize>('desktop')
  const [designSystem, setDesignSystem] = useState<string | null>(null)
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [designMode, setDesignMode] = useState<'single' | 'canvas'>('canvas')
  const [addPageOpen, setAddPageOpen] = useState(false)
  const [addPageName, setAddPageName] = useState('')
  const [addingPage, setAddingPage] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const pages = currentProject?.pages || []
  const pageEdges = currentProject?.pageEdges || []
  const agents: Agent[] = currentProject?.agents || []
  const selectedPage = pages.find((p) => p.id === selectedPageId) || pages[0] || null

  // Auto-select first page when pages load
  useEffect(() => {
    if (pages.length > 0 && !selectedPageId) {
      setSelectedPageId(pages[0].id)
    }
  }, [pages, selectedPageId])

  // If we already have pages, go straight to ready
  useEffect(() => {
    if (pages.length > 0 && phase === 'idle') {
      setPhase('ready')
    }
  }, [pages.length, phase])

  // Listen for agent chat messages from srcdoc iframes and proxy to API
  useEffect(() => {
    function handleAgentChat(e: MessageEvent) {
      if (!e.data || e.data.type !== 'tb-agent-chat') return
      const { agentId, payload } = e.data as {
        agentId: string
        payload: { messages: { role: string; content: string }[]; systemPrompt: string; knowledge: { title: string; content: string }[]; rules: string[] }
      }
      const source = e.source as Window | null

      authFetch(`/api/agent/${agentId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Agent API error')
          return res.json()
        })
        .then((data) => {
          source?.postMessage(
            { type: 'tb-agent-chat-response', agentId, response: data.response || data.message || '' },
            '*'
          )
        })
        .catch((err) => {
          source?.postMessage(
            { type: 'tb-agent-chat-response', agentId, error: err instanceof Error ? err.message : 'Unknown error' },
            '*'
          )
        })
    }
    window.addEventListener('message', handleAgentChat)
    return () => window.removeEventListener('message', handleAgentChat)
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!currentProject) return

    setGenError(null)
    setPhase('generating')

    try {
      const nodes = currentProject.nodes || []

      const res = await authFetch('/api/ai/generate-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectTitle: currentProject.title,
          projectDescription: currentProject.description,
          nodes: nodes.map((n) => ({
            id: n.id,
            type: n.type,
            title: n.title,
            description: n.description,
            parentId: n.parentId,
          })),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to generate pages')
      }

      const data = await res.json()
      const generatedPages: ProjectPage[] = (data.pages || []).map(
        (p: { id: string; title: string; route: string; html: string; linkedNodeIds: string[] }, i: number) => ({
          id: p.id || generateId(),
          title: p.title,
          route: p.route,
          html: p.html,
          linkedNodeIds: p.linkedNodeIds || [],
          position: { x: (i % 3) * 500, y: Math.floor(i / 3) * 440 },
        })
      )

      const generatedEdges: PageEdge[] = (data.edges || []).map(
        (e: { source: string; target: string; label: string }) => ({
          id: generateId(),
          source: e.source,
          target: e.target,
          label: e.label,
        })
      )

      if (generatedPages.length === 0) {
        throw new Error('AI returned no pages')
      }

      setPages(generatedPages, generatedEdges)
      setDesignSystem(data.designSystem || null)
      setSelectedPageId(generatedPages[0].id)
      setPhase('ready')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setGenError(msg)
      setPhase('error')
      console.error('Generate pages error:', err)
    }
  }, [currentProject, setPages])

  const handleRegenerate = useCallback(async () => {
    setDesignSystem(null)
    setSelectedPageId(null)
    await handleGenerate()
  }, [handleGenerate])

  const handlePageUpdated = useCallback(
    (pageId: string, newHtml: string) => {
      updatePageHtml(pageId, newHtml)
    },
    [updatePageHtml]
  )

  const handleDeletePage = useCallback(
    (pageId: string) => {
      removePage(pageId)
      if (selectedPageId === pageId) {
        const remaining = pages.filter((p) => p.id !== pageId)
        setSelectedPageId(remaining[0]?.id || null)
      }
    },
    [removePage, selectedPageId, pages]
  )

  const handleEditPageOnCanvas = useCallback(
    async (pageId: string, instruction: string) => {
      const page = pages.find((p) => p.id === pageId)
      if (!page || !currentProject) return

      const res = await authFetch('/api/ai/edit-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentHtml: page.html,
          instruction,
          pageTitle: page.title,
          pageRoute: page.route,
          designSystem,
          allPageTitles: pages.map((p) => p.title),
          projectDescription: currentProject.description,
          projectNodes: (currentProject.nodes || []).map((n) => ({
            type: n.type, title: n.title, description: n.description,
          })),
        }),
      })

      if (!res.ok || !res.body) throw new Error('Failed to edit page')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value, { stream: true })
      }

      const htmlMatch = fullText.match(/\nHTML:\n([\s\S]+)$/)
      const html = htmlMatch?.[1]?.trim() ?? ''
      if (html) {
        updatePageHtml(pageId, html)
        // Inject generated images progressively
        if (extractImagePlaceholders(html).length > 0) {
          injectGeneratedImages(html, authFetch).then((enriched) => {
            if (enriched !== html) updatePageHtml(pageId, enriched)
          }).catch(() => {})
        }
      }
    },
    [pages, currentProject, designSystem, updatePageHtml]
  )

  const handleDropAgent = useCallback(
    (pageId: string, agentId: string) => {
      const page = pages.find((p) => p.id === pageId)
      const agent = agents.find((a) => a.id === agentId)
      if (!page || !agent) return

      const color = agent.theme.primaryColor
      const pos = agent.theme.position === 'bottom-left' ? 'left: 24px;' : 'right: 24px;'
      const greeting = agent.greeting.replace(/'/g, '&#39;').replace(/"/g, '&quot;')
      const agentName = agent.name.replace(/"/g, '&quot;')

      // Encode agent config as base64 JSON so the iframe script can read it
      const agentConfig = {
        id: agent.id,
        name: agent.name,
        greeting: agent.greeting,
        systemPrompt: agent.systemPrompt,
        knowledge: agent.knowledge,
        rules: agent.rules.map((r) => r.rule),
        model: agent.model,
      }
      const configB64 = btoa(unescape(encodeURIComponent(JSON.stringify(agentConfig))))

      const widgetHtml = `
<!-- Agent Widget: ${agent.name} (Live) -->
<div id="agent-widget-${agent.id}" data-agent-config="${configB64}" style="position: fixed; bottom: 24px; ${pos} z-index: 9999; font-family: system-ui, sans-serif;">
  <div id="agent-chat-${agent.id}" style="display: none; width: 360px; height: 480px; background: white; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); overflow: hidden; flex-direction: column; margin-bottom: 12px;">
    <div style="background: ${color}; padding: 16px; display: flex; align-items: center; gap: 10px;">
      <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center;">
        <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1.07A7 7 0 0 1 14 23h-4a7 7 0 0 1-6.93-4H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 12 2zm-1 7a5 5 0 0 0-5 5v1h12v-1a5 5 0 0 0-5-5h-2zm-1 8a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2h-4z"/></svg>
      </div>
      <div>
        <div style="color: white; font-weight: 600; font-size: 14px;">${agentName}</div>
        <div style="color: rgba(255,255,255,0.7); font-size: 11px;">Online</div>
      </div>
    </div>
    <div id="agent-messages-${agent.id}" style="flex: 1; padding: 16px; overflow-y: auto;">
      <div style="background: #f3f4f6; border-radius: 12px; border-top-left-radius: 4px; padding: 10px 14px; font-size: 13px; max-width: 80%;">${greeting}</div>
    </div>
    <div style="border-top: 1px solid #e5e7eb; padding: 12px; display: flex; gap: 8px;">
      <input id="agent-input-${agent.id}" type="text" placeholder="Type a message..." style="flex: 1; border: 1px solid #e5e7eb; border-radius: 20px; padding: 8px 14px; font-size: 13px; outline: none;" />
      <button id="agent-send-${agent.id}" style="width: 36px; height: 36px; border-radius: 50%; background: ${color}; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;">
        <svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>
  </div>
  <button onclick="var c=document.getElementById('agent-chat-${agent.id}');c.style.display=c.style.display==='none'?'flex':'none'" style="width: 56px; height: 56px; border-radius: 50%; background: ${color}; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
    <svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  </button>
</div>
<script>
(function(){
  var AID = "${agent.id}";
  var widget = document.getElementById("agent-widget-" + AID);
  var cfg = JSON.parse(decodeURIComponent(escape(atob(widget.getAttribute("data-agent-config")))));
  var messagesEl = document.getElementById("agent-messages-" + AID);
  var inputEl = document.getElementById("agent-input-" + AID);
  var sendBtn = document.getElementById("agent-send-" + AID);
  var history = [];
  var sending = false;

  function addBubble(text, isUser) {
    var d = document.createElement("div");
    d.style.cssText = isUser
      ? "background: ${color}; color: white; border-radius: 12px; border-top-right-radius: 4px; padding: 10px 14px; font-size: 13px; max-width: 80%; margin-left: auto; margin-top: 8px;"
      : "background: #f3f4f6; border-radius: 12px; border-top-left-radius: 4px; padding: 10px 14px; font-size: 13px; max-width: 80%; margin-top: 8px;";
    d.textContent = text;
    messagesEl.appendChild(d);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return d;
  }

  function showTyping() {
    var d = document.createElement("div");
    d.id = "agent-typing-" + AID;
    d.style.cssText = "background: #f3f4f6; border-radius: 12px; border-top-left-radius: 4px; padding: 10px 14px; font-size: 13px; max-width: 80%; margin-top: 8px; color: #9ca3af;";
    d.textContent = "Thinking...";
    messagesEl.appendChild(d);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return d;
  }

  function sendMessage() {
    var text = inputEl.value.trim();
    if (!text || sending) return;
    sending = true;
    inputEl.value = "";
    addBubble(text, true);
    history.push({ role: "user", content: text });
    var typing = showTyping();

    window.parent.postMessage({
      type: "tb-agent-chat",
      agentId: cfg.id,
      payload: {
        messages: history.slice(),
        systemPrompt: cfg.systemPrompt,
        knowledge: cfg.knowledge,
        rules: cfg.rules
      }
    }, "*");

    function onResponse(e) {
      if (!e.data || e.data.type !== "tb-agent-chat-response" || e.data.agentId !== cfg.id) return;
      window.removeEventListener("message", onResponse);
      typing.remove();
      var reply = e.data.error ? ("Error: " + e.data.error) : (e.data.response || "No response");
      addBubble(reply, false);
      if (!e.data.error) history.push({ role: "assistant", content: reply });
      sending = false;
    }
    window.addEventListener("message", onResponse);
  }

  sendBtn.addEventListener("click", sendMessage);
  inputEl.addEventListener("keydown", function(e) { if (e.key === "Enter") sendMessage(); });
})();
<\/script>`

      const updatedHtml = page.html + widgetHtml
      updatePageHtml(pageId, updatedHtml)
    },
    [pages, agents, updatePageHtml]
  )

  const handleAddPage = useCallback(async () => {
    if (!addPageName.trim() || addingPage || !currentProject) return
    setAddingPage(true)

    const pageName = addPageName.trim()
    const slug = pageName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const routePath = `/${slug}`

    try {
      const res = await authFetch('/api/ai/edit-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentHtml: '<div class="p-8"><h1 class="text-2xl font-bold">New Page</h1></div>',
          instruction: `Create a full, polished page for "${pageName}" that matches the design system of the existing pages. Include proper header, content sections, and footer.`,
          pageTitle: pageName,
        }),
      })

      if (!res.ok) throw new Error('Failed to generate page')

      const data = await res.json()
      if (data.html) {
        const newPage: ProjectPage = {
          id: generateId(),
          title: pageName,
          route: routePath,
          html: data.html,
          linkedNodeIds: [],
          position: { x: pages.length % 3 * 500, y: Math.floor(pages.length / 3) * 440 },
        }
        setPages([...pages, newPage], pageEdges)
        setSelectedPageId(newPage.id)
        setAddPageOpen(false)
        setAddPageName('')
      }
    } catch (err) {
      console.error('Failed to add page:', err)
    } finally {
      setAddingPage(false)
    }
  }, [addPageName, addingPage, currentProject, pages, pageEdges, setPages])

  // ─── Empty / Idle State ─────────────────────────────────────
  if (phase === 'idle' && pages.length === 0) {
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
                AI will read your goals, features, and PRDs from the Plan tab, then generate polished webpage previews for every screen in your app.
              </p>
              {currentProject.nodes.length === 0 && (
                <p className="text-xs text-amber-500 mb-4">
                  Tip: Add some goals and features in the Plan tab first for better results.
                </p>
              )}
              <div className="flex items-center justify-center gap-3 mt-4">
                <Button onClick={handleGenerate} size="lg" className="gap-2">
                  <Sparkles className="h-5 w-5" />
                  Generate Pages
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Takes 15-30 seconds. No special browser requirements.
              </p>
            </>
          )}
        </div>
      </div>
    )
  }

  // ─── Generating State ──────────────────────────────────────
  if (phase === 'generating') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-sm">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Generating pages...</h3>
          <p className="text-sm text-muted-foreground">
            AI is reading your project plan and building polished page previews.
          </p>
        </div>
      </div>
    )
  }

  // ─── Error State ────────────────────────────────────────────
  if (phase === 'error' && pages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Generation Failed</h3>
          <p className="text-sm text-muted-foreground mb-4">{genError}</p>
          <Button onClick={handleGenerate} variant="default" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // ─── Ready State — Preview ─────────────────────────────────
  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-background/90 backdrop-blur-sm shrink-0">
        {/* Viewport switcher (single mode only) */}
        {designMode === 'single' && (
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
                aria-label={VIEWPORT_SIZES[size].label}
                aria-pressed={viewport === size}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        )}

        {/* View mode toggle */}
        <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
          <button
            onClick={() => setDesignMode('single')}
            className={cn(
              'p-1.5 rounded transition-colors',
              designMode === 'single'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title="Single page view"
            aria-label="Single page view"
            aria-pressed={designMode === 'single'}
          >
            <AppWindow className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setDesignMode('canvas')}
            className={cn(
              'p-1.5 rounded transition-colors',
              designMode === 'canvas'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title="All pages canvas"
            aria-label="All pages canvas"
            aria-pressed={designMode === 'canvas'}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Page navigator (single mode) */}
        {designMode === 'single' && pages.length > 0 && (
          <div className="relative flex items-center gap-1">
            <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <select
              value={selectedPageId || ''}
              onChange={(e) => setSelectedPageId(e.target.value)}
              className="h-7 text-xs bg-transparent border rounded-md px-2 pr-6 appearance-none cursor-pointer hover:bg-muted transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.route})
                </option>
              ))}
            </select>
            <button
              onClick={() => setAddPageOpen(true)}
              className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Add a new page"
              aria-label="Add a new page"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Add page (canvas mode) */}
        {designMode === 'canvas' && pages.length > 0 && (
          <button
            onClick={() => setAddPageOpen(true)}
            className="h-7 px-2 flex items-center gap-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground text-xs"
            title="Add a new page"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Page
          </button>
        )}

        {pages.length > 0 && (
          <div className="w-px h-5 bg-border" />
        )}

        {/* Actions */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={handleRegenerate}
          disabled={phase !== 'ready'}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Regenerate
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={() => {
            if (iframeRef.current && selectedPage) {
              iframeRef.current.srcdoc = wrapHtmlPage(selectedPage.html)
            }
          }}
          disabled={!selectedPage}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reload
        </Button>

        <div className="flex-1" />

        {/* Status */}
        {phase === 'ready' && (
          <div className="flex items-center gap-1.5 text-xs text-green-600">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {pages.length} page{pages.length !== 1 ? 's' : ''}
          </div>
        )}


        {/* Chat toggle */}
        <Button
          variant="ghost"
          size="sm"
          className={cn('h-7 gap-1.5 text-xs', chatOpen && 'bg-accent')}
          onClick={() => setChatOpen(!chatOpen)}
          disabled={!selectedPage}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          {selectedPage ? `Edit: ${selectedPage.title}` : 'Chat'}
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {designMode === 'single' && selectedPage && (
          <>
            {/* Page list sidebar */}
            <div className="w-56 border-r bg-muted/30 flex flex-col shrink-0 overflow-y-auto">
              {designSystem && (
                <div className="p-3 border-b">
                  <p className="text-xs text-muted-foreground leading-relaxed">{designSystem}</p>
                </div>
              )}
              <div className="py-1">
                {pages.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPageId(p.id)}
                    className={cn(
                      'w-full text-left px-3 py-2 text-xs transition-colors',
                      p.id === selectedPageId
                        ? 'bg-accent text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    )}
                  >
                    <div className="font-medium truncate">{p.title}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{p.route}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview iframe */}
            <div className="flex-1 bg-muted/20 flex items-start justify-center p-4 overflow-auto">
              <div
                className={cn(
                  'relative bg-background border rounded-lg shadow-lg overflow-hidden transition-all duration-300',
                  viewport === 'desktop' && 'w-full h-full',
                  viewport !== 'desktop' && 'h-[90%]'
                )}
                style={{
                  width: viewport !== 'desktop' ? VIEWPORT_SIZES[viewport].width : undefined,
                  maxWidth: '100%',
                }}
              >
                <iframe
                  ref={iframeRef}
                  srcDoc={wrapHtmlPage(selectedPage.html)}
                  title={`Preview: ${selectedPage.title}`}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts"
                />
                {isPageUpdating && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                        <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                        <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">Baguette is designing...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {designMode === 'canvas' && pages.length > 0 && (
          <div className="flex-1">
            <DesignCanvas
              pages={pages}
              pageEdges={pageEdges}
              agents={agents}
              selectedPageId={selectedPageId}
              onSelectPage={(pageId) => {
                setSelectedPageId(pageId)
                setChatOpen(true)
              }}
              onFocusPage={(pageId) => {
                setDesignMode('single')
                setSelectedPageId(pageId)
              }}
              onDeletePage={handleDeletePage}
              onEditPage={handleEditPageOnCanvas}
              onDropAgent={handleDropAgent}
              onPagePositionChange={(pageId: string, position: { x: number; y: number }) => {
                const updatePagePosition = useProjectStore.getState().updatePagePosition
                updatePagePosition(pageId, position)
              }}
            />
          </div>
        )}

        {designMode === 'canvas' && pages.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p className="text-sm">No pages generated yet.</p>
          </div>
        )}

        {/* Chat sidebar */}
        {chatOpen && selectedPage && (
          <PageChat
            page={selectedPage}
            onPageUpdated={handlePageUpdated}
            onClose={() => setChatOpen(false)}
            onLoadingChange={setIsPageUpdating}
            designSystem={designSystem}
            allPageTitles={pages.map((p) => p.title)}
            projectDescription={currentProject?.description}
            projectNodes={(currentProject?.nodes || []).map((n) => ({
              type: n.type, title: n.title, description: n.description,
            }))}
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
              AI will generate a new page matching your design system.
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
