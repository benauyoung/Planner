import type { Project, PlanNode } from '@/types/project'

/**
 * Export a subtree rooted at `nodeId` as structured markdown
 * optimized for AI coding agents (Cursor, Claude Code, etc.)
 */
export function exportSubtreeAsMarkdown(nodeId: string, project: Project): string {
  const node = project.nodes.find((n) => n.id === nodeId)
  if (!node) return ''

  const sections: string[] = []
  const typeLabel = node.type.charAt(0).toUpperCase() + node.type.slice(1)

  // Header
  sections.push(`# ${typeLabel}: ${node.title}`)
  if (node.description) {
    sections.push(`\n${node.description}`)
  }

  // Context — parent chain + dependencies
  const parentChain = getParentChain(node, project.nodes)
  const children = getDescendants(nodeId, project.nodes)
  const directChildren = project.nodes.filter((n) => n.parentId === nodeId)
  const siblings = node.parentId
    ? project.nodes.filter((n) => n.parentId === node.parentId && n.id !== nodeId)
    : []

  sections.push('\n## Context')
  if (parentChain.length > 0) {
    const chain = parentChain.map((n) => `${n.title} (${n.status})`).join(' → ')
    sections.push(`- **Hierarchy**: ${chain} → **${node.title}**`)
  }
  if (siblings.length > 0) {
    const siblingList = siblings.map((s) => `${s.title} (${s.status})`).join(', ')
    sections.push(`- **Sibling features**: ${siblingList}`)
  }
  if (directChildren.length > 0) {
    const blocking = directChildren.filter((c) => c.status !== 'completed')
    if (blocking.length > 0) {
      sections.push(`- **Subtasks**: ${directChildren.length} total, ${blocking.length} remaining`)
    }
  }

  // Decisions from Q&A
  const decisions = getDecisions(node)
  if (decisions.length > 0) {
    sections.push('\n## Decisions')
    for (const d of decisions) {
      sections.push(`- **${d.question}**: ${d.answer}`)
    }
  }

  // Acceptance criteria from children tasks
  const tasks = children.filter((n) => n.type === 'task')
  if (tasks.length > 0) {
    sections.push('\n## Acceptance Criteria')
    for (const task of tasks) {
      const checkbox = task.status === 'completed' ? '[x]' : '[ ]'
      sections.push(`- ${checkbox} ${task.title}`)
      if (task.description) {
        sections.push(`  ${task.description}`)
      }
      const taskDecisions = getDecisions(task)
      for (const d of taskDecisions) {
        sections.push(`  - ${d.question}: ${d.answer}`)
      }
    }
  }

  // Doc-specific metadata
  if (node.version) {
    sections.push(`- **Version**: ${node.version}`)
  }
  if (node.type === 'schema' && node.schemaType) {
    const schemaLabels: Record<string, string> = { data_model: 'Data Model', api_contract: 'API Contract', database: 'Database', other: 'Other' }
    sections.push(`- **Schema Type**: ${schemaLabels[node.schemaType] || node.schemaType}`)
  }
  if (node.type === 'prompt') {
    if (node.promptType) sections.push(`- **Prompt Type**: ${node.promptType}`)
    if (node.targetTool) sections.push(`- **Target Tool**: ${node.targetTool}`)
  }
  if (node.type === 'reference' && node.url) {
    sections.push(`- **URL**: ${node.url}`)
  }

  // Acceptance criteria (PRD nodes)
  if (node.acceptanceCriteria && node.acceptanceCriteria.length > 0) {
    sections.push('\n## Acceptance Criteria')
    for (const criterion of node.acceptanceCriteria) {
      sections.push(`- [ ] ${criterion}`)
    }
  }

  // Document blocks as markdown
  if (node.document && node.document.blocks.length > 0) {
    sections.push('\n## Document Content')
    sections.push(blocksToMarkdown(node.document.blocks))
  }

  // PRD content if available
  if (node.prds && node.prds.length > 0) {
    sections.push('\n## Requirements (from PRD)')
    for (const prd of node.prds) {
      sections.push(`\n### ${prd.title}`)
      sections.push(prd.content)
    }
  }

  // Constraints from prompts
  if (node.prompts && node.prompts.length > 0) {
    sections.push('\n## Implementation Notes')
    for (const prompt of node.prompts) {
      sections.push(`\n### ${prompt.title}`)
      sections.push(prompt.content)
    }
  }

  // Feature breakdown
  const features = children.filter((n) => n.type === 'feature')
  if (features.length > 0) {
    sections.push('\n## Feature Breakdown')
    for (const feature of features) {
      sections.push(`\n### ${feature.title}`)
      if (feature.description) sections.push(feature.description)
      const featureTasks = project.nodes.filter((n) => n.parentId === feature.id && n.type === 'task')
      if (featureTasks.length > 0) {
        for (const t of featureTasks) {
          const cb = t.status === 'completed' ? '[x]' : '[ ]'
          sections.push(`- ${cb} ${t.title}`)
        }
      }
    }
  }

  return sections.join('\n')
}

/**
 * Export the entire project as structured markdown.
 */
export function exportFullPlanAsMarkdown(project: Project): string {
  const sections: string[] = []

  sections.push(`# ${project.title}`)
  if (project.description) {
    sections.push(`\n${project.description}`)
  }

  // Progress overview
  const total = project.nodes.length
  const completed = project.nodes.filter((n) => n.status === 'completed').length
  const inProgress = project.nodes.filter((n) => n.status === 'in_progress').length
  const blocked = project.nodes.filter((n) => n.status === 'blocked').length

  sections.push('\n## Progress')
  sections.push(`- **Total nodes**: ${total}`)
  sections.push(`- **Completed**: ${completed} (${total > 0 ? Math.round((completed / total) * 100) : 0}%)`)
  sections.push(`- **In Progress**: ${inProgress}`)
  sections.push(`- **Blocked**: ${blocked}`)

  // Goals
  const goals = project.nodes.filter((n) => n.type === 'goal')
  for (const goal of goals) {
    sections.push(`\n---\n\n## Goal: ${goal.title}`)
    if (goal.description) sections.push(goal.description)

    const subgoals = project.nodes.filter((n) => n.parentId === goal.id)
    for (const subgoal of subgoals) {
      sections.push(`\n### ${subgoal.type === 'subgoal' ? 'Subgoal' : subgoal.type}: ${subgoal.title}`)
      if (subgoal.description) sections.push(subgoal.description)

      const features = project.nodes.filter((n) => n.parentId === subgoal.id)
      for (const feature of features) {
        sections.push(`\n#### ${feature.title} \`[${feature.status}]\``)
        if (feature.description) sections.push(feature.description)

        const decisions = getDecisions(feature)
        if (decisions.length > 0) {
          sections.push('\n**Decisions:**')
          for (const d of decisions) {
            sections.push(`- ${d.question}: ${d.answer}`)
          }
        }

        const tasks = project.nodes.filter((n) => n.parentId === feature.id)
        if (tasks.length > 0) {
          sections.push('')
          for (const task of tasks) {
            const cb = task.status === 'completed' ? '[x]' : '[ ]'
            sections.push(`- ${cb} ${task.title}${task.description ? ` — ${task.description}` : ''}`)
          }
        }
      }
    }
  }

  // Documentation section — group doc nodes by type
  const docTypes = ['spec', 'prd', 'schema', 'prompt', 'reference'] as const
  const docTypeLabels: Record<string, string> = { spec: 'Specifications', prd: 'PRDs', schema: 'Schemas', prompt: 'Prompts', reference: 'References' }
  const docNodes = project.nodes.filter((n) => docTypes.includes(n.type as typeof docTypes[number]))
  if (docNodes.length > 0) {
    sections.push('\n---\n\n## Documentation')
    for (const dt of docTypes) {
      const nodesOfType = docNodes.filter((n) => n.type === dt)
      if (nodesOfType.length === 0) continue
      sections.push(`\n### ${docTypeLabels[dt]}`)
      for (const dn of nodesOfType) {
        sections.push(`\n#### ${dn.title}${dn.version ? ` (v${dn.version})` : ''} \`[${dn.status}]\``)
        if (dn.description) sections.push(dn.description)
        if (dn.acceptanceCriteria && dn.acceptanceCriteria.length > 0) {
          sections.push('')
          for (const c of dn.acceptanceCriteria) sections.push(`- [ ] ${c}`)
        }
        if (dn.url) sections.push(`\n**URL**: ${dn.url}`)
        if (dn.document && dn.document.blocks.length > 0) {
          sections.push('')
          sections.push(blocksToMarkdown(dn.document.blocks))
        }
      }
    }
  }

  // Orphan nodes (no parentId, not goals, not doc types)
  const orphans = project.nodes.filter((n) => !n.parentId && n.type !== 'goal' && !docTypes.includes(n.type as typeof docTypes[number]))
  if (orphans.length > 0) {
    sections.push('\n---\n\n## Other Nodes')
    for (const orphan of orphans) {
      sections.push(`- **${orphan.type}**: ${orphan.title}${orphan.description ? ` — ${orphan.description}` : ''}`)
    }
  }

  return sections.join('\n')
}

// --- Helpers ---

function getParentChain(node: PlanNode, nodes: PlanNode[]): PlanNode[] {
  const chain: PlanNode[] = []
  let current = node.parentId ? nodes.find((n) => n.id === node.parentId) : null
  while (current) {
    chain.unshift(current)
    current = current.parentId ? nodes.find((n) => n.id === current!.parentId) : null
  }
  return chain
}

function getDescendants(nodeId: string, nodes: PlanNode[]): PlanNode[] {
  const descendants: PlanNode[] = []
  function collect(parentId: string) {
    const children = nodes.filter((n) => n.parentId === parentId)
    for (const child of children) {
      descendants.push(child)
      collect(child.id)
    }
  }
  collect(nodeId)
  return descendants
}

function getDecisions(node: PlanNode): { question: string; answer: string }[] {
  return (node.questions || [])
    .filter((q) => (q.answer ?? '').trim() !== '')
    .map((q) => ({ question: q.question, answer: q.answer }))
}

function blocksToMarkdown(blocks: import('@/types/project').DocumentBlock[]): string {
  const lines: string[] = []
  for (const block of blocks) {
    switch (block.type) {
      case 'heading': {
        const prefix = '#'.repeat(block.level + 1) // offset by 1 since we're nested
        lines.push(`${prefix} ${block.content}`)
        break
      }
      case 'paragraph':
        lines.push(block.content)
        lines.push('')
        break
      case 'code':
        lines.push(`\`\`\`${block.language}`)
        lines.push(block.content)
        lines.push('```')
        lines.push('')
        break
      case 'checklist':
        for (const item of block.items) {
          lines.push(`- [${item.checked ? 'x' : ' '}] ${item.text}`)
        }
        lines.push('')
        break
      case 'divider':
        lines.push('---')
        lines.push('')
        break
      case 'callout':
        lines.push(`> ${block.emoji} ${block.content}`)
        lines.push('')
        break
    }
  }
  return lines.join('\n').trim()
}
