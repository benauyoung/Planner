'use client'

import { useState, useCallback } from 'react'
import { useProjectStore } from '@/stores/project-store'
import type { SuggestionType } from '@/prompts/suggestion-system'

export interface SmartSuggestion {
  type: SuggestionType
  title: string
  description: string
  nodeIds: string[]
  severity: 'high' | 'medium' | 'low'
  action?: string
}

function buildProjectSummary(): string {
  const project = useProjectStore.getState().currentProject
  if (!project) return ''

  const sections: string[] = []
  sections.push(`# Project: ${project.title}`)
  if (project.description) sections.push(project.description)

  // Team
  if (project.team && project.team.length > 0) {
    sections.push(`\n## Team (${project.team.length} members)`)
    for (const m of project.team) {
      const assigned = project.nodes.filter((n) => n.assigneeId === m.id).length
      sections.push(`- ${m.name}: ${assigned} tasks assigned`)
    }
  }

  // Sprints
  if (project.sprints && project.sprints.length > 0) {
    sections.push(`\n## Sprints (${project.sprints.length})`)
    for (const s of project.sprints) {
      sections.push(`- ${s.name} (${s.status}): ${s.nodeIds.length} nodes`)
    }
  }

  // Nodes
  sections.push(`\n## Nodes (${project.nodes.length} total)`)
  for (const node of project.nodes) {
    const parts = [`- [${node.id}] (${node.type}) "${node.title}" — status: ${node.status}`]
    if (node.parentId) parts.push(`parent: ${node.parentId}`)
    if (node.assigneeId) {
      const member = project.team?.find((m) => m.id === node.assigneeId)
      if (member) parts.push(`assignee: ${member.name}`)
    }
    if (node.priority && node.priority !== 'none') parts.push(`priority: ${node.priority}`)
    if (node.estimatedHours) parts.push(`estimate: ${node.estimatedHours}h`)
    if (node.dueDate) parts.push(`due: ${new Date(node.dueDate).toISOString().split('T')[0]}`)
    if (node.tags && node.tags.length > 0) parts.push(`tags: ${node.tags.join(', ')}`)
    sections.push(parts.join(' | '))
    if (node.description) sections.push(`  ${node.description}`)
  }

  // Edges
  if (project.edges.length > 0) {
    sections.push(`\n## Edges (${project.edges.length})`)
    for (const edge of project.edges) {
      sections.push(`- ${edge.source} → ${edge.target} (${edge.edgeType || 'hierarchy'})`)
    }
  }

  return sections.join('\n')
}

export function useAISuggestions() {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyze = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const projectSummary = buildProjectSummary()
      if (!projectSummary) {
        setError('No project data to analyze')
        return
      }

      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectSummary }),
      })

      if (!res.ok) throw new Error('Failed to analyze project')
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setSuggestions(data.suggestions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const dismiss = useCallback((index: number) => {
    setSuggestions((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const clear = useCallback(() => {
    setSuggestions([])
    setError(null)
  }, [])

  return { suggestions, loading, error, analyze, dismiss, clear }
}
