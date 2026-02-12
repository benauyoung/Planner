import { useState, useCallback } from 'react'
import { useProjectStore } from '@/stores/project-store'
import { buildNodeContext } from '@/lib/node-context'
import type { IterationAction } from '@/prompts/iteration-system'
import type { Project, PlanNode, NodeType, EdgeType } from '@/types/project'

export interface AISuggestion {
  id: string
  type: 'add_node' | 'update_node' | 'delete_node' | 'add_edge' | 'estimate'
  targetNodeId?: string | null
  node?: {
    id: string
    type: NodeType
    title: string
    description: string
    parentId: string | null
  } | null
  edge?: {
    source: string
    target: string
    edgeType: EdgeType
  } | null
  estimatedHours?: number | null
  reason: string
  confidence: number
}

export interface IterationResult {
  message: string
  suggestions: AISuggestion[]
}

function buildPlanSummary(project: Project): string {
  const sections: string[] = []
  sections.push(`# ${project.title}`)
  if (project.description) sections.push(project.description)
  sections.push(`\nTotal nodes: ${project.nodes.length}`)

  const byType: Record<string, PlanNode[]> = {}
  for (const node of project.nodes) {
    if (!byType[node.type]) byType[node.type] = []
    byType[node.type].push(node)
  }

  for (const [type, nodes] of Object.entries(byType)) {
    sections.push(`\n## ${type}s (${nodes.length})`)
    for (const node of nodes) {
      const status = node.status === 'not_started' ? '○' : node.status === 'in_progress' ? '◐' : node.status === 'completed' ? '●' : '✕'
      sections.push(`- ${status} ${node.title}${node.description ? ` — ${node.description}` : ''}`)
    }
  }

  if (project.edges.length > 0) {
    sections.push(`\n## Dependency Edges (${project.edges.length})`)
    for (const edge of project.edges) {
      if (edge.edgeType && edge.edgeType !== 'hierarchy') {
        const source = project.nodes.find((n) => n.id === edge.source)
        const target = project.nodes.find((n) => n.id === edge.target)
        if (source && target) {
          sections.push(`- ${source.title} ${edge.edgeType === 'blocks' ? '→ blocks →' : '→ depends on →'} ${target.title}`)
        }
      }
    }
  }

  return sections.join('\n')
}

export function useAIIterate() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<IterationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const iterate = useCallback(async (action: IterationAction, nodeId?: string) => {
    const project = useProjectStore.getState().currentProject
    if (!project) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const nodeContext = nodeId
        ? buildNodeContext(nodeId, project)
        : `# Project: ${project.title}\n${project.description || ''}\nTotal nodes: ${project.nodes.length}`
      const fullPlanSummary = buildPlanSummary(project)

      const res = await fetch('/api/ai/iterate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, nodeContext, fullPlanSummary }),
      })

      if (!res.ok) throw new Error('AI iteration failed')

      const data: IterationResult = await res.json()
      setResult(data)
      return data
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const applySuggestion = useCallback((suggestion: AISuggestion) => {
    const store = useProjectStore.getState()
    const project = store.currentProject
    if (!project) return

    switch (suggestion.type) {
      case 'add_node': {
        if (suggestion.node) {
          store.addFreeNode(
            suggestion.node.type,
            suggestion.node.title,
            suggestion.node.parentId
          )
        }
        break
      }
      case 'update_node': {
        if (suggestion.targetNodeId && suggestion.node) {
          store.updateNodeContent(
            suggestion.targetNodeId,
            suggestion.node.title,
            suggestion.node.description
          )
        }
        break
      }
      case 'delete_node': {
        if (suggestion.targetNodeId) {
          store.deleteNode(suggestion.targetNodeId)
        }
        break
      }
      case 'add_edge': {
        if (suggestion.edge) {
          store.addDependencyEdge(
            suggestion.edge.source,
            suggestion.edge.target,
            suggestion.edge.edgeType as EdgeType
          )
        }
        break
      }
      case 'estimate': {
        // Store estimate in description for now (until custom fields are added in Phase 3)
        if (suggestion.targetNodeId && suggestion.estimatedHours) {
          const node = project.nodes.find((n) => n.id === suggestion.targetNodeId)
          if (node) {
            const estimateTag = `[Est: ${suggestion.estimatedHours}h]`
            const desc = node.description.includes('[Est:')
              ? node.description.replace(/\[Est: [\d.]+h\]/, estimateTag)
              : `${node.description} ${estimateTag}`.trim()
            store.updateNodeContent(suggestion.targetNodeId, node.title, desc)
          }
        }
        break
      }
    }
  }, [])

  const applyAll = useCallback((suggestions: AISuggestion[]) => {
    for (const s of suggestions) {
      applySuggestion(s)
    }
  }, [applySuggestion])

  const clearResult = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { iterate, applySuggestion, applyAll, clearResult, loading, result, error }
}
