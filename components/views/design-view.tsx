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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authFetch } from '@/lib/auth-fetch'
import { generateId } from '@/lib/id'
import type { ProjectPage, PageEdge, AppChatMessage } from '@/types/project'
import { DesignCanvas } from './design-canvas'

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
  <style>body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }</style>
</head>
<body>${bodyHtml}</body>
</html>`
}

// ─── Page Chat Sidebar ──────────────────────────────────────

function PageChat({
  page,
  onPageUpdated,
  onClose,
}: {
  page: ProjectPage
  onPageUpdated: (pageId: string, newHtml: string) => void
  onClose: () => void
}) {
  const addAppChatMessage = useProjectStore((s) => s.addAppChatMessage)

  const [messages, setMessages] = useState<AppChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const instruction = input.trim()
    if (!instruction || loading) return
    setInput('')

    const userMsg: AppChatMessage = {
      id: generateId(), role: 'user', content: instruction, timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMsg])
    addAppChatMessage(userMsg)
    setLoading(true)

    try {
      const res = await authFetch('/api/ai/edit-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentHtml: page.html,
          instruction,
          pageTitle: page.title,
        }),
      })

      if (!res.ok) throw new Error('Failed to edit page')

      const data = await res.json()
      const aiMsg: AppChatMessage = {
        id: generateId(), role: 'ai', content: data.summary || 'Updated!', timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, aiMsg])
      addAppChatMessage(aiMsg)

      if (data.html) {
        onPageUpdated(page.id, data.html)
      }
    } catch {
      const errMsg: AppChatMessage = {
        id: generateId(), role: 'ai', content: 'Failed to update. Try again.', timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-80 border-l bg-background flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0">
        <MessageSquare className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold flex-1 truncate">Edit: {page.title}</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <div className="text-xs text-muted-foreground text-center pt-8">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
            <p className="font-medium mb-1">Edit this page with AI</p>
            <p>Describe what you want to change.</p>
            <div className="mt-4 space-y-1.5 text-left">
              <p className="italic text-muted-foreground/60">&quot;Make the header blue&quot;</p>
              <p className="italic text-muted-foreground/60">&quot;Add a pricing section&quot;</p>
              <p className="italic text-muted-foreground/60">&quot;Change the layout to 3 columns&quot;</p>
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
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Updating page...
          </div>
        )}
      </div>

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
          <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleSend} disabled={!input.trim() || loading}>
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
      if (!page) return

      const res = await authFetch('/api/ai/edit-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentHtml: page.html,
          instruction,
          pageTitle: page.title,
        }),
      })

      if (!res.ok) throw new Error('Failed to edit page')

      const data = await res.json()
      if (data.html) {
        updatePageHtml(pageId, data.html)
      }
    },
    [pages, updatePageHtml]
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
                  'bg-background border rounded-lg shadow-lg overflow-hidden transition-all duration-300',
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
              </div>
            </div>
          </>
        )}

        {designMode === 'canvas' && pages.length > 0 && (
          <div className="flex-1">
            <DesignCanvas
              pages={pages}
              pageEdges={pageEdges}
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
