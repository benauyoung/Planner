import type { AIPlanNode } from '@/types/chat'

/**
 * Parse markdown text into AIPlanNode[] for ingestion via mergeNodes().
 * Supports:
 * - Heading hierarchy: # → goal, ## → subgoal, ### → feature, #### and deeper → task
 * - Checklist items (- [ ] / - [x]) → tasks under nearest parent
 * - YAML frontmatter (id, type, status, parent) for VisionPath/Spec Kit format
 * - Plain list items (- text) → tasks under nearest parent
 */
export function parseMarkdownToNodes(markdown: string): AIPlanNode[] {
  const nodes: AIPlanNode[] = []
  const lines = markdown.split('\n')

  // Strip frontmatter if present
  let startLine = 0
  if (lines[0]?.trim() === '---') {
    const endIdx = lines.indexOf('---', 1)
    if (endIdx > 0) {
      startLine = endIdx + 1
    }
  }

  // Track current parent IDs at each heading depth
  const parentStack: { id: string; depth: number }[] = []
  let nodeCounter = 0

  function nextId(prefix: string): string {
    nodeCounter++
    return `import-${prefix}-${nodeCounter}`
  }

  function getParentId(): string | null {
    if (parentStack.length === 0) return null
    return parentStack[parentStack.length - 1].id
  }

  function depthToType(depth: number): 'goal' | 'subgoal' | 'feature' | 'task' {
    if (depth <= 1) return 'goal'
    if (depth === 2) return 'subgoal'
    if (depth === 3) return 'feature'
    return 'task'
  }

  // Buffer for description lines
  let currentNodeId: string | null = null
  let descriptionBuffer: string[] = []

  function flushDescription() {
    if (currentNodeId && descriptionBuffer.length > 0) {
      const node = nodes.find((n) => n.id === currentNodeId)
      if (node) {
        node.description = descriptionBuffer.join(' ').trim()
      }
      descriptionBuffer = []
    }
  }

  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i]

    // Heading: # to ######
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      flushDescription()
      const depth = headingMatch[1].length
      const title = headingMatch[2].trim()
        .replace(/\s*`\[.*?\]`\s*$/, '') // strip status badges like `[in_progress]`
        .replace(/\s*\(.*?\)\s*$/, '') // strip trailing parenthetical

      // Pop stack back to parent depth
      while (parentStack.length > 0 && parentStack[parentStack.length - 1].depth >= depth) {
        parentStack.pop()
      }

      const type = depthToType(depth)
      const id = nextId(type)
      const parentId = getParentId()

      nodes.push({
        id,
        type,
        title,
        description: '',
        parentId,
      })

      parentStack.push({ id, depth })
      currentNodeId = id
      continue
    }

    // Checklist item: - [ ] or - [x]
    const checklistMatch = line.match(/^\s*[-*]\s+\[([ xX])\]\s+(.+)$/)
    if (checklistMatch) {
      flushDescription()
      const title = checklistMatch[2].trim()
        .replace(/\s*—\s*.*$/, '') // strip " — description" suffix
      const description = checklistMatch[2].includes('—')
        ? checklistMatch[2].split('—').slice(1).join('—').trim()
        : ''
      const id = nextId('task')
      const parentId = getParentId()

      nodes.push({
        id,
        type: 'task',
        title,
        description,
        parentId,
      })
      currentNodeId = id
      continue
    }

    // Plain list item (not checklist): - text or * text
    const listMatch = line.match(/^\s*[-*]\s+\*?\*?(.+?)\*?\*?\s*$/)
    if (listMatch && !line.match(/^\s*[-*]\s+\[/)) {
      flushDescription()

      // Check if this looks like a bold label (e.g. "- **Feature**: description")
      const boldMatch = line.match(/^\s*[-*]\s+\*\*(.+?)\*\*[:\s]*(.*)$/)
      if (boldMatch) {
        const label = boldMatch[1].trim()
        const desc = boldMatch[2].trim()

        // Try to detect type from label
        let type: 'goal' | 'subgoal' | 'feature' | 'task' = 'task'
        const lowerLabel = label.toLowerCase()
        if (lowerLabel.includes('goal')) type = 'goal'
        else if (lowerLabel.includes('subgoal') || lowerLabel.includes('milestone')) type = 'subgoal'
        else if (lowerLabel.includes('feature') || lowerLabel.includes('epic')) type = 'feature'

        const id = nextId(type)
        nodes.push({
          id,
          type,
          title: label,
          description: desc,
          parentId: getParentId(),
        })
        currentNodeId = id
      } else {
        // Treat as a task under current parent
        const title = listMatch[1].trim()
        if (title.length > 0) {
          const id = nextId('task')
          nodes.push({
            id,
            type: 'task',
            title,
            description: '',
            parentId: getParentId(),
          })
          currentNodeId = id
        }
      }
      continue
    }

    // Horizontal rule — skip
    if (line.match(/^---+\s*$/) || line.match(/^\*\*\*+\s*$/)) {
      continue
    }

    // Blockquote — skip
    if (line.match(/^>\s/)) {
      continue
    }

    // Non-empty text line → append to description of current node
    const trimmed = line.trim()
    if (trimmed.length > 0 && currentNodeId) {
      descriptionBuffer.push(trimmed)
    }
  }

  // Flush any remaining description
  flushDescription()

  return nodes
}

/**
 * Try to parse frontmatter-based VisionPath/Spec Kit format.
 * Returns null if the markdown doesn't have recognizable frontmatter.
 */
export function parseFrontmatterNodes(markdown: string): AIPlanNode[] | null {
  const lines = markdown.split('\n')
  if (lines[0]?.trim() !== '---') return null

  const endIdx = lines.indexOf('---', 1)
  if (endIdx < 0) return null

  const frontmatter = lines.slice(1, endIdx).join('\n')
  const body = lines.slice(endIdx + 1).join('\n')

  // Try to extract frontmatter fields
  const idMatch = frontmatter.match(/^id:\s*["']?(.+?)["']?\s*$/m)
  const typeMatch = frontmatter.match(/^type:\s*["']?(.+?)["']?\s*$/m)
  const statusMatch = frontmatter.match(/^status:\s*["']?(.+?)["']?\s*$/m)
  const parentMatch = frontmatter.match(/^parent:\s*["']?(.+?)["']?\s*$/m)

  if (!idMatch || !typeMatch) return null

  const titleMatch = body.match(/^#\s+(.+)$/m)
  const title = titleMatch?.[1] || 'Untitled'

  const descMatch = body.match(/^#\s+.+\n\n([\s\S]*?)(?=\n##\s|$)/)
  const description = descMatch?.[1]?.trim() || ''

  const validTypes = ['goal', 'subgoal', 'feature', 'task']
  const type = validTypes.includes(typeMatch[1]) ? typeMatch[1] as AIPlanNode['type'] : 'task'

  return [{
    id: idMatch[1],
    type,
    title,
    description,
    parentId: parentMatch?.[1] || null,
  }]
}
