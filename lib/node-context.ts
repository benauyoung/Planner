import type { Project, PlanNode } from '@/types/project'

/**
 * Builds a structured markdown context string for a node,
 * including its full hierarchy, Q&A, siblings, and children.
 * Used as input for AI generation of PRDs and prompts.
 */
export function buildNodeContext(nodeId: string, project: Project): string {
  const node = project.nodes.find((n) => n.id === nodeId)
  if (!node) return ''

  const sections: string[] = []

  // Project info
  sections.push(`# Project: ${project.title}`)
  if (project.description) {
    sections.push(project.description)
  }

  // Parent chain (from root down to parent)
  const parentChain = getParentChain(node, project.nodes)
  if (parentChain.length > 0) {
    sections.push('## Hierarchy Context')
    for (const ancestor of parentChain) {
      const indent = '  '.repeat(parentChain.indexOf(ancestor))
      sections.push(`${indent}- **${ancestor.type}**: ${ancestor.title}`)
      if (ancestor.description) {
        sections.push(`${indent}  ${ancestor.description}`)
      }
      const answeredQs = getAnsweredQuestions(ancestor)
      if (answeredQs.length > 0) {
        for (const q of answeredQs) {
          sections.push(`${indent}  - Q: ${q.question}`)
          sections.push(`${indent}    A: ${q.answer}`)
        }
      }
    }
  }

  // Target node
  sections.push(`## Target Node (${node.type}): ${node.title}`)
  if (node.description) {
    sections.push(node.description)
  }
  const nodeQs = getAnsweredQuestions(node)
  if (nodeQs.length > 0) {
    sections.push('### Decisions (Answered Questions)')
    for (const q of nodeQs) {
      sections.push(`- **Q:** ${q.question}`)
      sections.push(`  **A:** ${q.answer}`)
    }
  }

  // Doc-specific metadata
  if (node.version) sections.push(`- **Version**: ${node.version}`)
  if (node.schemaType) sections.push(`- **Schema Type**: ${node.schemaType}`)
  if (node.promptType) sections.push(`- **Prompt Type**: ${node.promptType}`)
  if (node.targetTool) sections.push(`- **Target Tool**: ${node.targetTool}`)
  if (node.url) sections.push(`- **URL**: ${node.url}`)
  if (node.acceptanceCriteria && node.acceptanceCriteria.length > 0) {
    sections.push('### Acceptance Criteria')
    for (const c of node.acceptanceCriteria) {
      sections.push(`- ${c}`)
    }
  }

  // Document block content
  if (node.document && node.document.blocks.length > 0) {
    sections.push('### Document Content')
    for (const block of node.document.blocks) {
      if ('content' in block && block.content) {
        sections.push(block.content)
      } else if (block.type === 'checklist') {
        for (const item of block.items) {
          sections.push(`- [${item.checked ? 'x' : ' '}] ${item.text}`)
        }
      }
    }
  }

  // Connected doc edges
  const docEdgeTypes = ['informs', 'defines', 'implements', 'references', 'supersedes']
  const outgoingDocEdges = project.edges.filter(
    (e) => e.source === nodeId && docEdgeTypes.includes(e.edgeType || '')
  )
  const incomingDocEdges = project.edges.filter(
    (e) => e.target === nodeId && docEdgeTypes.includes(e.edgeType || '')
  )
  if (outgoingDocEdges.length > 0 || incomingDocEdges.length > 0) {
    sections.push('### Document Relationships')
    for (const e of outgoingDocEdges) {
      const target = project.nodes.find((n) => n.id === e.target)
      if (target) sections.push(`- This node **${e.edgeType}** → ${target.type}: ${target.title}`)
    }
    for (const e of incomingDocEdges) {
      const source = project.nodes.find((n) => n.id === e.source)
      if (source) sections.push(`- ${source.type}: ${source.title} **${e.edgeType}** → this node`)
    }
  }

  // Siblings
  if (node.parentId) {
    const siblings = project.nodes.filter(
      (n) => n.parentId === node.parentId && n.id !== node.id
    )
    if (siblings.length > 0) {
      sections.push('### Sibling Nodes')
      for (const sib of siblings) {
        sections.push(`- **${sib.type}**: ${sib.title} — ${sib.description || '(no description)'}`)
      }
    }
  }

  // Children and grandchildren
  const children = project.nodes.filter((n) => n.parentId === nodeId)
  if (children.length > 0) {
    sections.push('### Children (Planned Breakdown)')
    for (const child of children) {
      sections.push(`- **${child.type}**: ${child.title}`)
      if (child.description) {
        sections.push(`  ${child.description}`)
      }
      const childQs = getAnsweredQuestions(child)
      if (childQs.length > 0) {
        for (const q of childQs) {
          sections.push(`  - Q: ${q.question}`)
          sections.push(`    A: ${q.answer}`)
        }
      }
      // Grandchildren (titles only)
      const grandchildren = project.nodes.filter((n) => n.parentId === child.id)
      if (grandchildren.length > 0) {
        for (const gc of grandchildren) {
          sections.push(`  - ${gc.type}: ${gc.title}`)
        }
      }
    }
  }

  return sections.join('\n')
}

function getParentChain(node: PlanNode, nodes: PlanNode[]): PlanNode[] {
  const chain: PlanNode[] = []
  let current = node.parentId ? nodes.find((n) => n.id === node.parentId) : null
  while (current) {
    chain.unshift(current)
    current = current.parentId ? nodes.find((n) => n.id === current!.parentId) : null
  }
  return chain
}

function getAnsweredQuestions(node: PlanNode) {
  return (node.questions || []).filter((q) => (q.answer ?? '').trim() !== '')
}
