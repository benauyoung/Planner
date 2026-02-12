'use client'

import { useMemo, useState } from 'react'
import {
  ChevronRight,
  ChevronDown,
  Target,
  Flag,
  Puzzle,
  CheckSquare,
  ImagePlus,
  FileText,
  Circle,
} from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { useUIStore } from '@/stores/ui-store'
import { NODE_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { PlanNode, NodeType, NodeStatus } from '@/types/project'

const EMPTY_NODES: PlanNode[] = []

const TYPE_ICONS: Record<NodeType, React.ReactNode> = {
  goal: <Target className="h-3.5 w-3.5" />,
  subgoal: <Flag className="h-3.5 w-3.5" />,
  feature: <Puzzle className="h-3.5 w-3.5" />,
  task: <CheckSquare className="h-3.5 w-3.5" />,
  moodboard: <ImagePlus className="h-3.5 w-3.5" />,
  notes: <FileText className="h-3.5 w-3.5" />,
  connector: <Circle className="h-3.5 w-3.5" />,
}

const STATUS_DOTS: Record<NodeStatus, string> = {
  not_started: 'bg-gray-400',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  blocked: 'bg-red-500',
}

interface TreeNode extends PlanNode {
  children: TreeNode[]
  depth: number
}

function buildTree(nodes: PlanNode[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>()
  const roots: TreeNode[] = []

  for (const node of nodes) {
    nodeMap.set(node.id, { ...node, children: [], depth: 0 })
  }

  for (const node of nodes) {
    const treeNode = nodeMap.get(node.id)!
    if (node.parentId && nodeMap.has(node.parentId)) {
      const parent = nodeMap.get(node.parentId)!
      treeNode.depth = parent.depth + 1
      parent.children.push(treeNode)
    } else {
      roots.push(treeNode)
    }
  }

  return roots
}

function flattenTree(nodes: TreeNode[], expanded: Set<string>): TreeNode[] {
  const result: TreeNode[] = []
  function walk(items: TreeNode[]) {
    for (const node of items) {
      result.push(node)
      if (node.children.length > 0 && expanded.has(node.id)) {
        walk(node.children)
      }
    }
  }
  walk(nodes)
  return result
}

export function ListView() {
  const nodes = useProjectStore((s) => s.currentProject?.nodes ?? EMPTY_NODES)
  const selectedNodeId = useUIStore((s) => s.selectedNodeId)
  const selectNode = useUIStore((s) => s.selectNode)
  const searchQuery = useUIStore((s) => s.searchQuery)
  const filterType = useUIStore((s) => s.filterType)
  const filterStatus = useUIStore((s) => s.filterStatus)

  const [expanded, setExpanded] = useState<Set<string>>(() => {
    return new Set(nodes.filter((n) => nodes.some((c) => c.parentId === n.id)).map((n) => n.id))
  })

  const filteredNodes = useMemo(() => {
    let result = nodes
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((n) =>
        n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q)
      )
    }
    if (filterType) result = result.filter((n) => n.type === filterType)
    if (filterStatus) result = result.filter((n) => n.status === filterStatus)
    return result
  }, [nodes, searchQuery, filterType, filterStatus])

  const hasFilters = searchQuery || filterType || filterStatus

  const tree = useMemo(() => buildTree(hasFilters ? filteredNodes : nodes), [filteredNodes, nodes, hasFilters])
  const flatList = useMemo(
    () => (hasFilters ? filteredNodes.map((n) => ({ ...n, children: [], depth: 0 } as TreeNode)) : flattenTree(tree, expanded)),
    [tree, expanded, hasFilters, filteredNodes]
  )

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (flatList.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
        {hasFilters ? 'No nodes match your filters' : 'No nodes in this project'}
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="py-1">
        {flatList.map((node) => {
          const hasChildren = !hasFilters && nodes.some((n) => n.parentId === node.id)
          const isExpanded = expanded.has(node.id)
          const isSelected = node.id === selectedNodeId

          return (
            <button
              key={node.id}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left transition-colors hover:bg-muted/50',
                isSelected && 'bg-primary/10 text-primary'
              )}
              style={{ paddingLeft: `${12 + node.depth * 20}px` }}
              onClick={() => selectNode(node.id)}
            >
              {/* Expand/collapse toggle */}
              {hasChildren ? (
                <button
                  className="shrink-0 p-0.5 rounded hover:bg-muted transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleExpand(node.id)
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
              ) : (
                <span className="w-[22px] shrink-0" />
              )}

              {/* Status dot */}
              <span className={cn('w-2 h-2 rounded-full shrink-0', STATUS_DOTS[node.status])} />

              {/* Type icon */}
              <span style={{ color: NODE_CONFIG[node.type]?.color }}>
                {TYPE_ICONS[node.type]}
              </span>

              {/* Title */}
              <span className="truncate flex-1">{node.title}</span>

              {/* Type badge */}
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider shrink-0">
                {node.type}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
