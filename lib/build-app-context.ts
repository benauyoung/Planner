import type { Project, PlanNode } from '@/types/project'

/**
 * Build a structured context string from the project's Plan tab data
 * for the AI app generation prompt. Keeps total output under ~8K tokens.
 */
export function buildAppGenerationContext(project: Project): string {
  const sections: string[] = []

  // ─── Project Overview ──────────────────────────────────────
  sections.push(`# Project: ${project.title}`)
  if (project.description) {
    sections.push(`## Description\n${project.description}`)
  }

  // ─── Node Hierarchy ────────────────────────────────────────
  const nodes = project.nodes || []
  if (nodes.length > 0) {
    sections.push('## Project Structure')

    // Build parent→children map
    const childrenMap = new Map<string | null, PlanNode[]>()
    for (const node of nodes) {
      const pid = node.parentId
      if (!childrenMap.has(pid)) childrenMap.set(pid, [])
      childrenMap.get(pid)!.push(node)
    }

    // Render tree recursively (max depth 4 to keep context bounded)
    function renderTree(parentId: string | null, depth: number): string {
      if (depth > 4) return ''
      const children = childrenMap.get(parentId) || []
      if (children.length === 0) return ''

      const indent = '  '.repeat(depth)
      return children
        .map((n) => {
          const status = n.status === 'completed' ? '✅' : n.status === 'in_progress' ? '🔄' : n.status === 'blocked' ? '🚫' : '⬜'
          let line = `${indent}- [${n.type}] ${status} ${n.title}`
          if (n.description) {
            const desc = n.description.length > 150 ? n.description.slice(0, 150) + '...' : n.description
            line += `\n${indent}  ${desc}`
          }
          return line + renderTree(n.id, depth + 1)
        })
        .join('\n')
    }

    sections.push(renderTree(null, 0))
  }

  // ─── PRDs ──────────────────────────────────────────────────
  const prds: { nodeTitle: string; prdTitle: string; content: string }[] = []
  for (const node of nodes) {
    if (node.prds && node.prds.length > 0) {
      for (const prd of node.prds) {
        prds.push({
          nodeTitle: node.title,
          prdTitle: prd.title,
          content: prd.content,
        })
      }
    }
  }

  if (prds.length > 0) {
    sections.push('## PRDs (Product Requirements Documents)')
    // Limit to first 5 PRDs to stay within token budget
    const limited = prds.slice(0, 5)
    for (const prd of limited) {
      const content = prd.content.length > 500 ? prd.content.slice(0, 500) + '...' : prd.content
      sections.push(`### ${prd.prdTitle} (for: ${prd.nodeTitle})\n${content}`)
    }
    if (prds.length > 5) {
      sections.push(`(${prds.length - 5} more PRDs omitted for brevity)`)
    }
  }

  // ─── Answered Questions ────────────────────────────────────
  const qaPairs: { nodeTitle: string; question: string; answer: string }[] = []
  for (const node of nodes) {
    if (node.questions && node.questions.length > 0) {
      for (const q of node.questions) {
        if (q.answer && q.answer.trim()) {
          qaPairs.push({
            nodeTitle: node.title,
            question: q.question,
            answer: q.answer,
          })
        }
      }
    }
  }

  if (qaPairs.length > 0) {
    sections.push('## Answered Questions')
    // Limit to first 15 Q&A pairs
    const limited = qaPairs.slice(0, 15)
    for (const qa of limited) {
      sections.push(`**Q (${qa.nodeTitle}):** ${qa.question}\n**A:** ${qa.answer}`)
    }
    if (qaPairs.length > 15) {
      sections.push(`(${qaPairs.length - 15} more Q&A pairs omitted)`)
    }
  }

  // ─── Features List (for page inference) ────────────────────
  const features = nodes.filter((n) => n.type === 'feature')
  if (features.length > 0) {
    sections.push('## Features')
    for (const f of features) {
      const tasks = nodes.filter((n) => n.parentId === f.id && n.type === 'task')
      let line = `- **${f.title}**`
      if (f.description) line += `: ${f.description}`
      if (tasks.length > 0) {
        line += `\n  Tasks: ${tasks.map((t) => t.title).join(', ')}`
      }
      sections.push(line)
    }
  }

  // ─── Existing Pages (if migrating) ─────────────────────────
  if (project.pages && project.pages.length > 0) {
    sections.push('## Existing Page Structure')
    for (const page of project.pages) {
      sections.push(`- **${page.title}** (${page.route})`)
    }
    sections.push('Use this page structure as a starting point. Generate improved React components for each page.')
  }

  return sections.join('\n\n')
}
