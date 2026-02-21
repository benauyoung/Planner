import type { Project, PlanNode, NodePRD, NodeType } from '@/types/project'

/**
 * Builds context specifically for PRD generation.
 * Wraps buildNodeContext() and appends a Ralphy scope directive
 * that instructs the AI on the correct format and scope constraints.
 */
export function buildPrdContext(nodeId: string, project: Project): string {
  const base = buildNodeContext(nodeId, project)
  const node = project.nodes.find((n) => n.id === nodeId)
  if (!node) return base
  const directive = buildRalphyDirective(node.type)
  return directive ? `${base}\n\n${directive}` : base
}

function buildRalphyDirective(type: NodeType | string): string {
  if (type === 'feature' || type === 'task') {
    return `## Ralphy Scope Directive
This PRD will be consumed by Ralphy — an autonomous AI coding loop that runs \`ralphy --prd <file>.md\` and loops until all checklist items pass. Ralphy sees only this one file.

**Hard requirements for this PRD:**
- **Self-contained**: Embed all key technical decisions inline (from Q&A, parent PRD context, and tech context above). Do NOT just reference other PRDs — extract and restate the constraints that apply here.
- **Scope**: Exactly one implementable unit that one AI agent can complete end-to-end in one coding session. If the scope feels too large, narrow it.
- **Word budget**: 800–1200 words (not counting the checklist section).
- **Must end with \`## Implementation Checklist\`**: 5–15 \`- [ ]\` tasks in execution order. Each task is one atomic, verifiable action (e.g. "- [ ] Create \`POST /api/auth/login\` route with email + password validation"). No vague items like "- [ ] Implement feature".
- **Must end with \`## Run with Ralphy\`**: Include the exact command, agent recommendation (cursor / claude / codex), estimated complexity (S / M / L), and the scope boundary (which files or directories Ralphy should modify).`
  }

  if (type === 'subgoal') {
    return `## Ralphy Scope Directive
This is a workstream summary PRD — it is NOT directly implementable by Ralphy. Child feature/task PRDs are the Ralphy inputs.

**Requirements:**
- 300–600 words maximum.
- List each child feature with a one-sentence scope description and a reference to its PRD if one exists.
- Do NOT include an Implementation Checklist or Run with Ralphy section.
- This PRD's role is to give an AI a map of the workstream before it starts implementing individual features.`
  }

  if (type === 'goal') {
    return `## Ralphy Scope Directive
This is a strategic summary PRD — it is NOT directly implementable by Ralphy.

**Requirements:**
- 200–400 words maximum.
- Define the goal's strategic purpose and success metrics.
- List child subgoals/features with PRD references where they exist.
- Do NOT include an Implementation Checklist or Run with Ralphy section.`
  }

  return ''
}

/**
 * Builds a structured markdown context string for a node,
 * including its full hierarchy, Q&A, siblings, children,
 * structured PRD ecosystem, and tech context.
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
      if (q.category) {
        sections.push(`- **[${q.category}] Q:** ${q.question}`)
      } else {
        sections.push(`- **Q:** ${q.question}`)
      }
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

  // Structured PRD Ecosystem (replaces flat "Related PRDs")
  const prdEcosystem = buildPrdEcosystem(nodeId, project)
  sections.push(prdEcosystem)

  // Project tech context
  const techContext = extractTechContext(node, project)
  if (techContext) {
    sections.push('## Project Tech Context')
    sections.push(techContext)
  }

  return sections.join('\n')
}

/**
 * Builds a structured PRD ecosystem section that tells the AI about:
 * - Scope level (goal/subgoal → summary, feature/task → detailed)
 * - Parent PRD (what this node rolls up to)
 * - Child PRDs (what this PRD should summarize/reference)
 * - Sibling PRDs (what's handled by parallel nodes — scope boundaries)
 * - Dependency PRDs (from typed edges: blocks, depends_on, informs, defines)
 */
function buildPrdEcosystem(nodeId: string, project: Project): string {
  const node = project.nodes.find((n) => n.id === nodeId)
  if (!node) return ''

  const lines: string[] = []
  lines.push('## PRD Ecosystem')

  // Scope hint
  const scope = getScopeInstruction(node.type)
  lines.push(`\n**Scope Level**: ${node.type} — ${scope}`)

  let hasAnyPrd = false

  // ── Parent PRD ──
  const parent = node.parentId ? project.nodes.find((n) => n.id === node.parentId) : null
  if (parent?.prds && parent.prds.length > 0) {
    hasAnyPrd = true
    lines.push('\n### Parent PRD (this node rolls up to)')
    lines.push(`**${parent.title}** (${parent.type})`)
    // Use only the most recent parent PRD to keep context tight
    const prd = parent.prds[parent.prds.length - 1]
    lines.push(`**"${prd.title}"** [${parent.id}:${prd.id}]`)
    const truncated = prd.content.length > 1200 ? prd.content.slice(0, 1200) + '\n...' : prd.content
    lines.push(truncated)
  }

  // ── Child PRDs ──
  const children = project.nodes.filter((n) => n.parentId === nodeId)
  const childrenWithPrds = children.filter((c) => c.prds && c.prds.length > 0)
  if (childrenWithPrds.length > 0) {
    hasAnyPrd = true
    lines.push('\n### Child PRDs (summarize/reference these — do not duplicate their detail)')
    for (const child of childrenWithPrds) {
      const prd = child.prds![child.prds!.length - 1]
      lines.push(`\n#### ${child.title} (${child.type}): "${prd.title}" [${child.id}:${prd.id}]`)
      const truncated = prd.content.length > 500 ? prd.content.slice(0, 500) + '\n...' : prd.content
      lines.push(truncated)
    }
  }

  // ── Sibling PRDs ──
  const siblings = node.parentId
    ? project.nodes.filter(
        (n) => n.parentId === node.parentId && n.id !== nodeId && n.prds && n.prds.length > 0
      )
    : []
  if (siblings.length > 0) {
    hasAnyPrd = true
    lines.push("\n### Sibling PRDs (scope boundaries — what's handled by parallel nodes)")
    for (const sib of siblings.slice(0, 4)) {
      const prd = sib.prds![sib.prds!.length - 1]
      lines.push(`\n#### ${sib.title} (${sib.type}): "${prd.title}" [${sib.id}:${prd.id}]`)
      const truncated = prd.content.length > 300 ? prd.content.slice(0, 300) + '\n...' : prd.content
      lines.push(truncated)
    }
  }

  // ── Dependency PRDs (typed edges) ──
  const depEdgeTypes = ['blocks', 'depends_on', 'informs', 'defines']
  type DepEntry = { node: PlanNode; edgeType: string; direction: 'outgoing' | 'incoming' }
  const depEntries: DepEntry[] = []
  for (const e of project.edges) {
    if (!depEdgeTypes.includes(e.edgeType || '')) continue
    const isSource = e.source === nodeId
    const isTarget = e.target === nodeId
    if (!isSource && !isTarget) continue
    const otherId = isSource ? e.target : e.source
    const otherNode = project.nodes.find((n) => n.id === otherId)
    if (otherNode?.prds?.length) {
      depEntries.push({ node: otherNode, edgeType: e.edgeType!, direction: isSource ? 'outgoing' : 'incoming' })
    }
  }
  if (depEntries.length > 0) {
    hasAnyPrd = true
    lines.push('\n### Dependency PRDs (linked via typed edges)')
    for (const { node: depNode, edgeType, direction } of depEntries.slice(0, 4)) {
      const rel = direction === 'outgoing' ? `this →[${edgeType}]→` : `←[${edgeType}]← this`
      const prd = depNode.prds![depNode.prds!.length - 1]
      lines.push(`\n#### [${rel}] ${depNode.title}: "${prd.title}" [${depNode.id}:${prd.id}]`)
      const truncated = prd.content.length > 400 ? prd.content.slice(0, 400) + '\n...' : prd.content
      lines.push(truncated)
    }
  }

  if (!hasAnyPrd) {
    lines.push('\n*No related PRDs exist yet — this will be the first PRD written for this part of the project.*')
  }

  return lines.join('\n')
}

/**
 * Returns a scope instruction based on node type.
 * Goals/subgoals → high-level summary PRDs.
 * Features/tasks → detailed implementation PRDs.
 */
function getScopeInstruction(type: NodeType | string): string {
  switch (type) {
    case 'goal':
      return 'Write a high-level strategic PRD (200–400 words). Define the "why", success metrics, and high-level scope. Reference child PRDs rather than repeating their implementation detail.'
    case 'subgoal':
      return 'Write a summary PRD (300–600 words). Define this workstream\'s scope, acceptance criteria, and how child features compose it. Reference child PRDs.'
    case 'feature':
      return 'Write a detailed implementation PRD (500–1000 words) with user stories, functional requirements, acceptance criteria, and edge cases.'
    case 'task':
      return 'Write a focused technical PRD (300–600 words) with specific implementation steps, tooling decisions, testable acceptance criteria, and edge cases.'
    default:
      return 'Write a comprehensive PRD appropriate for this node type.'
  }
}

/**
 * Extracts project tech context by scanning:
 * - Ancestor Q&A answers that mention specific technologies
 * - Spec/schema nodes connected via informs/defines edges
 */
function extractTechContext(node: PlanNode, project: Project): string | null {
  const lines: string[] = []

  // Tech signals from ancestor + own Q&A
  const parentChain = getParentChain(node, project.nodes)
  const techAnswers: string[] = []
  for (const ancestor of [...parentChain, node]) {
    for (const q of getAnsweredQuestions(ancestor)) {
      if (TECH_PATTERN.test(q.answer) || TECH_PATTERN.test(q.question)) {
        techAnswers.push(`[${ancestor.type}: ${ancestor.title}] ${q.question}: ${q.answer}`)
      }
    }
  }
  if (techAnswers.length > 0) {
    lines.push('**Tech Decisions from Q&A:**')
    for (const a of techAnswers.slice(0, 8)) {
      lines.push(`- ${a}`)
    }
  }

  // Spec/schema nodes connected via informs/defines → this node
  const specEdges = project.edges.filter(
    (e) => ['informs', 'defines'].includes(e.edgeType || '') && e.target === node.id
  )
  for (const e of specEdges.slice(0, 2)) {
    const specNode = project.nodes.find((n) => n.id === e.source)
    if (specNode && (specNode.type === 'spec' || specNode.type === 'schema')) {
      const docContent = getNodeDocContent(specNode)
      if (docContent) {
        lines.push(`\n**${specNode.type}: ${specNode.title}** (${e.edgeType} → this node)`)
        lines.push(docContent.slice(0, 800))
      }
    }
  }

  return lines.length > 0 ? lines.join('\n') : null
}

const TECH_PATTERN =
  /react|next\.?js|vue|angular|svelte|typescript|python|node\.?js|express|fastapi|django|postgres|mysql|sqlite|mongodb|redis|supabase|firebase|aws|vercel|netlify|docker|kubernetes|graphql|rest|tailwind|prisma|drizzle|zustand|redux|trpc|stripe|auth0|clerk|jwt/i

function getNodeDocContent(node: PlanNode): string {
  if (!node.document?.blocks.length) return ''
  return node.document.blocks
    .map((block) => {
      if ('content' in block && block.content) return block.content
      if (block.type === 'checklist') return block.items.map((i) => `- ${i.text}`).join('\n')
      return ''
    })
    .filter(Boolean)
    .join('\n')
}

/**
 * Gathers PRDs from related nodes: parent chain, siblings, children, and edge-connected nodes.
 * Returns up to 10 related PRDs with truncated content.
 * @deprecated Use buildPrdEcosystem (via buildNodeContext) for PRD generation — this remains for any external callers.
 */
export function gatherRelatedPRDs(
  nodeId: string,
  project: Project
): { nodeId: string; nodeTitle: string; prd: NodePRD; compoundKey: string }[] {
  const node = project.nodes.find((n) => n.id === nodeId)
  if (!node) return []

  const relatedNodeIds = new Set<string>()

  const parentChain = getParentChain(node, project.nodes)
  for (const p of parentChain) relatedNodeIds.add(p.id)

  if (node.parentId) {
    for (const n of project.nodes) {
      if (n.parentId === node.parentId && n.id !== nodeId) relatedNodeIds.add(n.id)
    }
  }

  for (const n of project.nodes) {
    if (n.parentId === nodeId) relatedNodeIds.add(n.id)
  }

  for (const e of project.edges) {
    if (e.source === nodeId) relatedNodeIds.add(e.target)
    if (e.target === nodeId) relatedNodeIds.add(e.source)
  }

  relatedNodeIds.delete(nodeId)

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
