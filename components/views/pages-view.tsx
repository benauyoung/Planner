'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type NodeProps,
  type OnNodesChange,
  type OnEdgesChange,
} from '@xyflow/react'
import { useProjectStore } from '@/stores/project-store'
import { cn } from '@/lib/utils'
import {
  Sparkles,
  Loader2,
  Send,
  X,
  Trash2,
  Copy,
  ExternalLink,
  MessageSquare,
  AppWindow,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ProjectPage, PageEdge } from '@/types/project'

// ─── Constants ──────────────────────────────────────────────

const PAGE_WIDTH = 1280
const PAGE_HEIGHT = 800
const CARD_SCALE = 0.3
const CARD_W = PAGE_WIDTH * CARD_SCALE
const CARD_H = PAGE_HEIGHT * CARD_SCALE
const CARD_HEADER = 36
const NODE_WIDTH = CARD_W + 2
const NODE_HEIGHT = CARD_H + CARD_HEADER + 2

const TAILWIND_CDN = `<script src="https://cdn.tailwindcss.com"></script>`

// ─── Iframe Page Card ───────────────────────────────────────

function PageIframe({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!iframeRef.current) return
    const doc = iframeRef.current.contentDocument
    if (!doc) return
    doc.open()
    doc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  ${TAILWIND_CDN}
  <style>
    body { margin: 0; overflow: hidden; }
    * { box-sizing: border-box; }
  </style>
</head>
<body>${html}</body>
</html>`)
    doc.close()
  }, [html])

  return (
    <iframe
      ref={iframeRef}
      title="Page preview"
      className="pointer-events-none border-0"
      style={{
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        transform: `scale(${CARD_SCALE})`,
        transformOrigin: 'top left',
      }}
      sandbox="allow-scripts"
    />
  )
}

// ─── Page Node Component ────────────────────────────────────

interface PageNodeData {
  title: string
  route: string
  html: string
  [key: string]: unknown
}

function PageNodeComponent({ data, selected }: NodeProps<Node<PageNodeData>>) {
  return (
    <div
      className={cn(
        'bg-background border rounded-lg overflow-hidden shadow-md transition-shadow',
        selected ? 'ring-2 ring-primary shadow-xl' : 'hover:shadow-lg'
      )}
      style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}
    >
      <Handle type="target" position={Position.Left} />

      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 border-b bg-muted/50"
        style={{ height: CARD_HEADER }}
      >
        <AppWindow className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs font-semibold truncate flex-1">{data.title}</span>
        <span className="text-[10px] text-muted-foreground font-mono shrink-0">{data.route}</span>
      </div>

      {/* Iframe preview */}
      <div
        className="overflow-hidden"
        style={{ width: CARD_W, height: CARD_H }}
      >
        {data.html ? (
          <PageIframe html={data.html} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/20 text-muted-foreground text-xs">
            No preview
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  )
}

const nodeTypes = { page: PageNodeComponent }

// ─── Layout helper ──────────────────────────────────────────

function layoutPages(pages: ProjectPage[], pageEdges: PageEdge[]): ProjectPage[] {
  if (pages.length === 0) return pages

  // Build adjacency for topological-ish ordering
  const inDegree = new Map<string, number>()
  const children = new Map<string, string[]>()
  for (const p of pages) {
    inDegree.set(p.id, 0)
    children.set(p.id, [])
  }
  for (const e of pageEdges) {
    inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1)
    children.get(e.source)?.push(e.target)
  }

  // BFS from roots (in-degree 0)
  const queue: string[] = []
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id)
  }

  const visited = new Set<string>()
  const columns: string[][] = []
  let currentLevel = [...queue]

  while (currentLevel.length > 0) {
    const col: string[] = []
    const nextLevel: string[] = []
    for (const id of currentLevel) {
      if (visited.has(id)) continue
      visited.add(id)
      col.push(id)
      for (const child of children.get(id) || []) {
        if (!visited.has(child)) nextLevel.push(child)
      }
    }
    if (col.length > 0) columns.push(col)
    currentLevel = nextLevel
  }

  // Add any remaining unvisited pages
  const remaining = pages.filter((p) => !visited.has(p.id))
  if (remaining.length > 0) {
    columns.push(remaining.map((p) => p.id))
  }

  // Position: columns left-to-right, items top-to-bottom within each column
  const GAP_X = NODE_WIDTH + 120
  const GAP_Y = NODE_HEIGHT + 80
  const positionMap = new Map<string, { x: number; y: number }>()

  for (let col = 0; col < columns.length; col++) {
    const items = columns[col]
    const totalHeight = items.length * NODE_HEIGHT + (items.length - 1) * 80
    const startY = -totalHeight / 2

    for (let row = 0; row < items.length; row++) {
      positionMap.set(items[row], {
        x: col * GAP_X,
        y: startY + row * (NODE_HEIGHT + 80),
      })
    }
  }

  return pages.map((p) => ({
    ...p,
    position: positionMap.get(p.id) || p.position,
  }))
}

// ─── Inline Chat Panel ──────────────────────────────────────

function InlineChat({
  page,
  onClose,
  onUpdate,
}: {
  page: ProjectPage
  onClose: () => void
  onUpdate: (html: string) => void
}) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const instruction = input.trim()
    if (!instruction || loading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: instruction }])
    setLoading(true)

    try {
      const res = await fetch('/api/ai/edit-page', {
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
      setMessages((prev) => [...prev, { role: 'ai', content: data.summary || 'Updated!' }])
      onUpdate(data.html)
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'ai', content: 'Failed to update. Try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-80 border-l bg-background flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0">
        <MessageSquare className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold flex-1 truncate">{page.title}</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <div className="text-xs text-muted-foreground text-center pt-8">
            <p className="font-medium mb-1">Edit this page with AI</p>
            <p>Describe what you want to change.</p>
            <p className="mt-2 italic">e.g. &quot;Add a dark mode toggle&quot;</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              'text-xs rounded-lg px-3 py-2 max-w-[90%]',
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground ml-auto'
                : 'bg-muted text-foreground'
            )}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Updating page...
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

// ─── Pages View ─────────────────────────────────────────────

export function PagesView() {
  const currentProject = useProjectStore((s) => s.currentProject)
  const setPages = useProjectStore((s) => s.setPages)
  const updatePageHtml = useProjectStore((s) => s.updatePageHtml)
  const updatePagePosition = useProjectStore((s) => s.updatePagePosition)
  const removePage = useProjectStore((s) => s.removePage)

  const [generating, setGenerating] = useState(false)
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pages = currentProject?.pages || []
  const pageEdges = currentProject?.pageEdges || []

  // Convert pages to React Flow nodes
  const flowNodes: Node[] = pages.map((p) => ({
    id: p.id,
    type: 'page',
    position: p.position,
    data: { title: p.title, route: p.route, html: p.html },
    style: { width: NODE_WIDTH, height: NODE_HEIGHT },
  }))

  const flowEdges: Edge[] = pageEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    type: 'smoothstep',
    animated: true,
    style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
    labelStyle: { fontSize: 10, fontWeight: 600 },
    labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.9 },
    labelBgPadding: [6, 4] as [number, number],
    labelBgBorderRadius: 4,
  }))

  const [nodes, setNodes] = useState<Node[]>(flowNodes)
  const [edges, setEdges] = useState<Edge[]>(flowEdges)

  // Sync when pages change
  useEffect(() => {
    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [pages.length, pageEdges.length])

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  )

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  )

  const onNodeDragStop = useCallback(
    (_: unknown, node: Node) => {
      updatePagePosition(node.id, node.position)
    },
    [updatePagePosition]
  )

  const onNodeClick = useCallback((_: unknown, node: Node) => {
    setSelectedPageId(node.id)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedPageId(null)
  }, [])

  const handleGenerate = async () => {
    if (!currentProject || generating) return
    setGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/generate-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectTitle: currentProject.title,
          projectDescription: currentProject.description,
          nodes: currentProject.nodes.map((n) => ({
            id: n.id,
            type: n.type,
            title: n.title,
            description: n.description,
            parentId: n.parentId,
          })),
        }),
      })

      if (!res.ok) throw new Error('Failed to generate pages')

      const data = await res.json()

      // Create ProjectPage objects with auto-layout positions
      const rawPages: ProjectPage[] = (data.pages || []).map((p: { id: string; title: string; route: string; html: string; linkedNodeIds: string[] }) => ({
        id: p.id,
        title: p.title,
        route: p.route,
        html: p.html,
        linkedNodeIds: p.linkedNodeIds || [],
        position: { x: 0, y: 0 },
      }))

      const rawEdges: PageEdge[] = (data.edges || []).map((e: { source: string; target: string; label: string }, i: number) => ({
        id: `page-edge-${i}`,
        source: e.source,
        target: e.target,
        label: e.label,
      }))

      // Apply flow-grouped layout
      const layoutedPages = layoutPages(rawPages, rawEdges)
      setPages(layoutedPages, rawEdges)
    } catch (err) {
      console.error(err)
      setError('Failed to generate pages. Check your API key and try again.')
    } finally {
      setGenerating(false)
    }
  }

  const selectedPage = pages.find((p) => p.id === selectedPageId) || null

  const handleCopyHtml = () => {
    if (selectedPage) {
      navigator.clipboard.writeText(selectedPage.html)
    }
  }

  const handleDeletePage = () => {
    if (selectedPage) {
      removePage(selectedPage.id)
      setSelectedPageId(null)
    }
  }

  const handlePageUpdate = (html: string) => {
    if (selectedPageId) {
      updatePageHtml(selectedPageId, html)
    }
  }

  // Empty state
  if (pages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <AppWindow className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Page Previews</h3>
          <p className="text-sm text-muted-foreground mb-6">
            AI will scan your project plan, identify every user-facing page, and generate
            full-fidelity Tailwind previews. All pages are laid out by navigation flow.
          </p>
          {error && (
            <p className="text-xs text-destructive mb-4">{error}</p>
          )}
          <Button onClick={handleGenerate} disabled={generating} className="gap-2">
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating pages...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate All Pages
              </>
            )}
          </Button>
          {generating && (
            <p className="text-xs text-muted-foreground mt-3">
              This may take 15-30 seconds...
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {/* Canvas */}
      <div className="flex-1 relative">
        {/* Floating toolbar */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-background/90 backdrop-blur-sm border rounded-lg px-2 py-1 shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Regenerate
          </Button>
          {selectedPage && (
            <>
              <div className="w-px h-4 bg-border" />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleCopyHtml}
                title="Copy HTML"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={handleDeletePage}
                title="Delete page"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={onNodeDragStop}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2, duration: 500 }}
          minZoom={0.05}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
          className="bg-background"
        >
          <Background gap={20} size={1} />
          <Controls className="!bg-background !border !shadow-md" />
          <MiniMap
            nodeColor="hsl(var(--primary) / 0.3)"
            maskColor="hsl(var(--background) / 0.8)"
            className="!bg-muted !border !shadow-md"
          />
        </ReactFlow>
      </div>

      {/* Inline chat panel */}
      {selectedPage && (
        <InlineChat
          key={selectedPage.id}
          page={selectedPage}
          onClose={() => setSelectedPageId(null)}
          onUpdate={handlePageUpdate}
        />
      )}
    </div>
  )
}
