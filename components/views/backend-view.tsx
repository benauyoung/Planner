'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
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
  MessageSquare,
  Server,
  Database,
  Shield,
  Settings,
  Workflow,
  Globe,
  Code2,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BackendModule, BackendEdge, BackendModuleType } from '@/types/project'

// ─── Constants ──────────────────────────────────────────────

const CARD_WIDTH = 320
const CARD_HEIGHT = 240
const NODE_WIDTH = CARD_WIDTH + 2
const NODE_HEIGHT = CARD_HEIGHT + 2

const MODULE_COLORS: Record<BackendModuleType, { bg: string; border: string; icon: string }> = {
  endpoint: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: 'text-blue-500' },
  model: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: 'text-purple-500' },
  service: { bg: 'bg-green-500/10', border: 'border-green-500/30', icon: 'text-green-500' },
  middleware: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: 'text-orange-500' },
  database: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', icon: 'text-cyan-500' },
  auth: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: 'text-red-500' },
  config: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: 'text-yellow-500' },
}

const MODULE_ICONS: Record<BackendModuleType, typeof Server> = {
  endpoint: Globe,
  model: Database,
  service: Workflow,
  middleware: Shield,
  database: Database,
  auth: Shield,
  config: Settings,
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-green-500/20 text-green-700 dark:text-green-400',
  POST: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
  PUT: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
  PATCH: 'bg-orange-500/20 text-orange-700 dark:text-orange-400',
  DELETE: 'bg-red-500/20 text-red-700 dark:text-red-400',
}

// ─── Module Node Component ──────────────────────────────────

interface ModuleNodeData {
  moduleType: BackendModuleType
  title: string
  description: string
  code: string
  method?: string
  path?: string
  fields?: { name: string; type: string; required: boolean }[]
  [key: string]: unknown
}

function ModuleNodeComponent({ data, selected }: NodeProps<Node<ModuleNodeData>>) {
  const colors = MODULE_COLORS[data.moduleType] || MODULE_COLORS.service
  const Icon = MODULE_ICONS[data.moduleType] || Server

  return (
    <div
      className={cn(
        'bg-background border rounded-lg overflow-hidden shadow-md transition-shadow',
        colors.border,
        selected ? 'ring-2 ring-primary shadow-xl' : 'hover:shadow-lg'
      )}
      style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}
    >
      <Handle type="target" position={Position.Left} />

      {/* Header */}
      <div className={cn('flex items-center gap-2 px-3 py-2 border-b', colors.bg)}>
        <Icon className={cn('h-4 w-4 shrink-0', colors.icon)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold truncate">{data.title}</span>
            {data.method && (
              <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded', METHOD_COLORS[data.method] || '')}>
                {data.method}
              </span>
            )}
          </div>
          {data.path && (
            <span className="text-[10px] text-muted-foreground font-mono block truncate">{data.path}</span>
          )}
        </div>
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium shrink-0">
          {data.moduleType}
        </span>
      </div>

      {/* Description */}
      <div className="px-3 py-1.5 border-b">
        <p className="text-[10px] text-muted-foreground line-clamp-2">{data.description}</p>
      </div>

      {/* Code preview */}
      <div className="px-3 py-2 flex-1 overflow-hidden">
        {data.fields && data.fields.length > 0 ? (
          <div className="space-y-0.5">
            {data.fields.slice(0, 5).map((f, i) => (
              <div key={i} className="flex items-center gap-1 text-[10px] font-mono">
                <span className="text-foreground">{f.name}</span>
                <span className="text-muted-foreground">:</span>
                <span className="text-primary/80">{f.type}</span>
                {f.required && <span className="text-red-400">*</span>}
              </div>
            ))}
            {data.fields.length > 5 && (
              <span className="text-[9px] text-muted-foreground">+{data.fields.length - 5} more</span>
            )}
          </div>
        ) : (
          <pre className="text-[9px] font-mono text-muted-foreground whitespace-pre-wrap line-clamp-6 leading-relaxed">
            {data.code}
          </pre>
        )}
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  )
}

const nodeTypes = { module: ModuleNodeComponent }

// ─── Layout helper ──────────────────────────────────────────

function layoutModules(modules: BackendModule[], edges: BackendEdge[]): BackendModule[] {
  if (modules.length === 0) return modules

  const inDegree = new Map<string, number>()
  const children = new Map<string, string[]>()
  for (const m of modules) {
    inDegree.set(m.id, 0)
    children.set(m.id, [])
  }
  for (const e of edges) {
    inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1)
    children.get(e.source)?.push(e.target)
  }

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

  const remaining = modules.filter((m) => !visited.has(m.id))
  if (remaining.length > 0) {
    columns.push(remaining.map((m) => m.id))
  }

  const GAP_X = NODE_WIDTH + 100
  const GAP_Y = NODE_HEIGHT + 60
  const positionMap = new Map<string, { x: number; y: number }>()

  for (let col = 0; col < columns.length; col++) {
    const items = columns[col]
    const totalHeight = items.length * NODE_HEIGHT + (items.length - 1) * 60
    const startY = -totalHeight / 2

    for (let row = 0; row < items.length; row++) {
      positionMap.set(items[row], {
        x: col * GAP_X,
        y: startY + row * (NODE_HEIGHT + 60),
      })
    }
  }

  return modules.map((m) => ({
    ...m,
    position: positionMap.get(m.id) || m.position,
  }))
}

// ─── Edge colors by type ────────────────────────────────────

const EDGE_TYPE_STYLES: Record<string, { stroke: string; animated: boolean; dasharray?: string }> = {
  uses: { stroke: 'hsl(217 91% 60%)', animated: false },
  returns: { stroke: 'hsl(142 71% 45%)', animated: false },
  stores: { stroke: 'hsl(199 89% 48%)', animated: true },
  middleware: { stroke: 'hsl(24 95% 53%)', animated: false, dasharray: '6 3' },
  depends_on: { stroke: 'hsl(262 83% 58%)', animated: false, dasharray: '8 4' },
}

// ─── Inline Chat Panel ──────────────────────────────────────

function InlineChat({
  module: mod,
  onClose,
  onUpdate,
}: {
  module: BackendModule
  onClose: () => void
  onUpdate: (code: string) => void
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
      const res = await fetch('/api/ai/edit-backend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentCode: mod.code,
          instruction,
          moduleTitle: mod.title,
          moduleType: mod.type,
        }),
      })

      if (!res.ok) throw new Error('Failed to edit module')

      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'ai', content: data.summary || 'Updated!' }])
      onUpdate(data.code)
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', content: 'Failed to update. Try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-96 border-l bg-background flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0">
        <MessageSquare className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold flex-1 truncate">{mod.title}</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Code preview */}
      <div className="border-b px-3 py-2 max-h-48 overflow-y-auto shrink-0">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Code2 className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Current Code</span>
        </div>
        <pre className="text-[10px] font-mono text-foreground/80 whitespace-pre-wrap leading-relaxed">
          {mod.code}
        </pre>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <div className="text-xs text-muted-foreground text-center pt-8">
            <p className="font-medium mb-1">Edit this module with AI</p>
            <p>Describe what you want to change.</p>
            <p className="mt-2 italic">e.g. &quot;Add pagination to the list endpoint&quot;</p>
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
            Updating module...
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

// ─── Backend View ───────────────────────────────────────────

export function BackendView() {
  const currentProject = useProjectStore((s) => s.currentProject)
  const setBackendModules = useProjectStore((s) => s.setBackendModules)
  const updateBackendModule = useProjectStore((s) => s.updateBackendModule)
  const updateBackendModulePosition = useProjectStore((s) => s.updateBackendModulePosition)
  const removeBackendModule = useProjectStore((s) => s.removeBackendModule)

  const [generating, setGenerating] = useState(false)
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const modules = currentProject?.backendModules || []
  const backendEdges = currentProject?.backendEdges || []

  // Convert modules to React Flow nodes
  const flowNodes: Node[] = useMemo(() => modules.map((m) => ({
    id: m.id,
    type: 'module',
    position: m.position,
    data: {
      moduleType: m.type,
      title: m.title,
      description: m.description,
      code: m.code,
      method: m.method,
      path: m.path,
      fields: m.fields,
    },
    style: { width: NODE_WIDTH, height: NODE_HEIGHT },
  })), [modules])

  const flowEdges: Edge[] = useMemo(() => backendEdges.map((e) => {
    const style = EDGE_TYPE_STYLES[e.edgeType || 'uses'] || EDGE_TYPE_STYLES.uses
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      type: 'smoothstep',
      animated: style.animated,
      style: { stroke: style.stroke, strokeWidth: 2, strokeDasharray: style.dasharray },
      labelStyle: { fontSize: 9, fontWeight: 600 },
      labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.9 },
      labelBgPadding: [6, 4] as [number, number],
      labelBgBorderRadius: 4,
    }
  }), [backendEdges])

  const [nodes, setNodes] = useState<Node[]>(flowNodes)
  const [edges, setEdges] = useState<Edge[]>(flowEdges)

  useEffect(() => {
    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [modules.length, backendEdges.length])

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
      updateBackendModulePosition(node.id, node.position)
    },
    [updateBackendModulePosition]
  )

  const onNodeClick = useCallback((_: unknown, node: Node) => {
    setSelectedModuleId(node.id)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedModuleId(null)
  }, [])

  const handleGenerate = async () => {
    if (!currentProject || generating) return
    setGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/generate-backend', {
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

      if (!res.ok) throw new Error('Failed to generate backend')

      const data = await res.json()

      const rawModules: BackendModule[] = (data.modules || []).map((m: BackendModule) => ({
        id: m.id,
        type: m.type,
        title: m.title,
        description: m.description,
        code: m.code,
        linkedNodeIds: m.linkedNodeIds || [],
        position: { x: 0, y: 0 },
        method: m.method,
        path: m.path,
        fields: m.fields,
      }))

      const rawEdges: BackendEdge[] = (data.edges || []).map((e: BackendEdge, i: number) => ({
        id: `backend-edge-${i}`,
        source: e.source,
        target: e.target,
        label: e.label,
        edgeType: e.edgeType,
      }))

      const layoutedModules = layoutModules(rawModules, rawEdges)
      setBackendModules(layoutedModules, rawEdges)
    } catch (err) {
      console.error(err)
      setError('Failed to generate backend architecture. Check your API key and try again.')
    } finally {
      setGenerating(false)
    }
  }

  const selectedModule = modules.find((m) => m.id === selectedModuleId) || null

  const handleCopyCode = () => {
    if (selectedModule) {
      navigator.clipboard.writeText(selectedModule.code)
    }
  }

  const handleDeleteModule = () => {
    if (selectedModule) {
      removeBackendModule(selectedModule.id)
      setSelectedModuleId(null)
    }
  }

  const handleModuleUpdate = (code: string) => {
    if (selectedModuleId) {
      updateBackendModule(selectedModuleId, { code })
    }
  }

  // Module type counts for the legend
  const typeCounts = useMemo(() => {
    const counts: Partial<Record<BackendModuleType, number>> = {}
    for (const m of modules) {
      counts[m.type] = (counts[m.type] || 0) + 1
    }
    return counts
  }, [modules])

  // Empty state
  if (modules.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Server className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Backend Architecture</h3>
          <p className="text-sm text-muted-foreground mb-6">
            AI will scan your project plan, identify every backend component needed, and generate
            a full architecture diagram with API endpoints, data models, services, and more.
          </p>
          {error && (
            <p className="text-xs text-destructive mb-4">{error}</p>
          )}
          <Button onClick={handleGenerate} disabled={generating} className="gap-2">
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating architecture...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Backend
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
          {selectedModule && (
            <>
              <div className="w-px h-4 bg-border" />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleCopyCode}
                title="Copy code"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={handleDeleteModule}
                title="Delete module"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>

        {/* Legend */}
        <div className="absolute top-3 right-3 z-10 bg-background/90 backdrop-blur-sm border rounded-lg px-3 py-2 shadow-sm">
          <div className="text-[10px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Modules</div>
          <div className="space-y-1">
            {(Object.entries(typeCounts) as [BackendModuleType, number][]).map(([type, count]) => {
              const Icon = MODULE_ICONS[type] || Server
              const colors = MODULE_COLORS[type] || MODULE_COLORS.service
              return (
                <div key={type} className="flex items-center gap-1.5 text-[10px]">
                  <Icon className={cn('h-3 w-3', colors.icon)} />
                  <span className="capitalize">{type}</span>
                  <span className="text-muted-foreground ml-auto">{count}</span>
                </div>
              )
            })}
          </div>
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
      {selectedModule && (
        <InlineChat
          key={selectedModule.id}
          module={selectedModule}
          onClose={() => setSelectedModuleId(null)}
          onUpdate={handleModuleUpdate}
        />
      )}
    </div>
  )
}
