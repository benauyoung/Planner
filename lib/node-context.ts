import type { Project, PlanNode, NodePRD } from '@/types/project'

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

  // Related PRDs from connected nodes
  const relatedPRDs = gatherRelatedPRDs(nodeId, project)
  if (relatedPRDs.length > 0) {
    sections.push('### Related PRDs')
    for (const { nodeTitle, prd, compoundKey } of relatedPRDs) {
      const truncated = prd.content.length > 1500
        ? prd.content.slice(0, 1500) + '...'
        : prd.content
      sections.push(`#### ${prd.title} (in ${nodeTitle}) [${compoundKey}]`)
      sections.push(truncated)
    }
  }

  return sections.join('\n')
}

/**
 * Gathers PRDs from related nodes: parent chain, siblings, children, and edge-connected nodes.
 * Returns up to 10 related PRDs with truncated content.
 */
export function gatherRelatedPRDs(
  nodeId: string,
  project: Project
): { nodeId: string; nodeTitle: string; prd: NodePRD; compoundKey: string }[] {
  const node = project.nodes.find((n) => n.id === nodeId)
  if (!node) return []

  const relatedNodeIds = new Set<string>()

  // Parent chain
  const parentChain = getParentChain(node, project.nodes)
  for (const p of parentChain) relatedNodeIds.add(p.id)

  // Siblings
  if (node.parentId) {
    for (const n of project.nodes) {
      if (n.parentId === node.parentId && n.id !== nodeId) relatedNodeIds.add(n.id)
    }
  }

  // Children
  for (const n of project.nodes) {
    if (n.parentId === nodeId) relatedNodeIds.add(n.id)
  }

  // Edge-connected nodes
  for (const e of project.edges) {
    if (e.source === nodeId) relatedNodeIds.add(e.target)
    if (e.target === nodeId) relatedNodeIds.add(e.source)
  }

  // Remove self
  relatedNodeIds.delete(nodeId)

  // Collect PRDs from related nodes, capped at 10
  const results: { nodeId: string; nodeTitle: string; prd: NodePRD; compoundKey: string }[] = []
  for (const relId of relatedNodeIds) {
    if (results.length >= 10) break
    const relNode = project.nodes.find((n) => n.id === relId)
    if (!relNode?.prds) continue
    for (const prd of relNode.prds) {
      if (results.length >= 10) break
      results.push({
        nodeId: relId,
        nodeTitle: relNode.title,
        prd,
        compoundKey: `${relId}:${prd.id}`,
      })
    }
  }

  return results
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
