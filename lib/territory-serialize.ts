import type { PlanNode, Project, ProjectEdge, NodeType, NodeStatus, Priority } from '@/types/project'

// ── File tree structure ──
// .territory/
//   project.yaml        — project metadata + edges
//   goals/<id>.md       — one file per goal
//   subgoals/<id>.md
//   features/<id>.md
//   tasks/<id>.md
//   docs/<id>.md         — spec, prd, schema, prompt, reference, notes, moodboard, connector

const TYPE_FOLDERS: Record<string, string> = {
  goal: 'goals',
  subgoal: 'subgoals',
  feature: 'features',
  task: 'tasks',
  spec: 'docs',
  prd: 'docs',
  schema: 'docs',
  prompt: 'docs',
  reference: 'docs',
  notes: 'docs',
  moodboard: 'docs',
  connector: 'docs',
}

// ── Serialize a single node to frontmatter + markdown ──

export function nodeToMarkdown(node: PlanNode): string {
  const fm: Record<string, unknown> = {
    id: node.id,
    type: node.type,
    status: node.status,
  }

  if (node.parentId) fm.parent = node.parentId
  if (node.collapsed) fm.collapsed = true
  if (node.priority && node.priority !== 'none') fm.priority = node.priority
  if (node.assigneeId) fm.assignee = node.assigneeId
  if (node.tags && node.tags.length > 0) fm.tags = node.tags
  if (node.dueDate) fm.dueDate = node.dueDate
  if (node.estimatedHours) fm.estimatedHours = node.estimatedHours
  if (node.sprintId) fm.sprintId = node.sprintId
  if (node.version) fm.version = node.version
  if (node.schemaType) fm.schemaType = node.schemaType
  if (node.promptType) fm.promptType = node.promptType
  if (node.targetTool) fm.targetTool = node.targetTool
  if (node.referenceType) fm.referenceType = node.referenceType
  if (node.url) fm.url = node.url
  if (node.acceptanceCriteria && node.acceptanceCriteria.length > 0) {
    fm.acceptanceCriteria = node.acceptanceCriteria
  }

  // Questions with answers
  if (node.questions && node.questions.length > 0) {
    const answeredQs = node.questions.filter((q) => q.answer)
    if (answeredQs.length > 0) {
      fm.decisions = answeredQs.map((q) => ({
        question: q.question,
        answer: q.answer,
      }))
    }
  }

  const frontmatter = serializeYaml(fm)
  const sections: string[] = []

  sections.push(`---\n${frontmatter}---`)
  sections.push(`# ${node.title}`)

  if (node.description) {
    sections.push('')
    sections.push(node.description)
  }

  // Rich text content (notes nodes)
  if (node.content) {
    sections.push('')
    sections.push('## Content')
    sections.push('')
    sections.push(node.content)
  }

  // PRDs
  if (node.prds && node.prds.length > 0) {
    for (const prd of node.prds) {
      sections.push('')
      sections.push(`## PRD: ${prd.title}`)
      sections.push('')
      sections.push(prd.content)
    }
  }

  // Prompts
  if (node.prompts && node.prompts.length > 0) {
    for (const prompt of node.prompts) {
      sections.push('')
      sections.push(`## Prompt: ${prompt.title}`)
      sections.push('')
      sections.push(prompt.content)
    }
  }

  return sections.join('\n') + '\n'
}

// ── Deserialize markdown back to a PlanNode ──

export function markdownToNode(content: string): PlanNode | null {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!fmMatch) return null

  const fm = parseYaml(fmMatch[1])
  const body = fmMatch[2]

  const id = fm.id as string
  const type = fm.type as NodeType
  if (!id || !type) return null

  // Extract title from first heading
  const titleMatch = body.match(/^#\s+(.+)$/m)
  const title = titleMatch?.[1]?.trim() || 'Untitled'

  // Extract description — text between title and first ## section
  const afterTitle = body.replace(/^#\s+.+\n?/, '')
  const descMatch = afterTitle.match(/^([\s\S]*?)(?=\n## |\n*$)/)
  const description = descMatch?.[1]?.trim() || ''

  // Extract content section
  const contentMatch = body.match(/## Content\n\n([\s\S]*?)(?=\n## |\n*$)/)
  const nodeContent = contentMatch?.[1]?.trim() || undefined

  // Extract PRDs
  const prdRegex = /## PRD: (.+)\n\n([\s\S]*?)(?=\n## |\n*$)/g
  const prds: PlanNode['prds'] = []
  let prdMatch
  while ((prdMatch = prdRegex.exec(body)) !== null) {
    prds.push({
      id: `${id}-prd-${prds.length}`,
      title: prdMatch[1].trim(),
      content: prdMatch[2].trim(),
      updatedAt: Date.now(),
    })
  }

  // Extract Prompts
  const promptRegex = /## Prompt: (.+)\n\n([\s\S]*?)(?=\n## |\n*$)/g
  const prompts: PlanNode['prompts'] = []
  let promptMatch
  while ((promptMatch = promptRegex.exec(body)) !== null) {
    prompts.push({
      id: `${id}-prompt-${prompts.length}`,
      title: promptMatch[1].trim(),
      content: promptMatch[2].trim(),
      updatedAt: Date.now(),
    })
  }

  // Rebuild questions from decisions
  const decisions = (fm.decisions || []) as { question: string; answer: string }[]
  const questions = decisions.map((d, i) => ({
    id: `${id}-q${i}`,
    question: d.question,
    answer: d.answer,
  }))

  const node: PlanNode = {
    id,
    type,
    title,
    description,
    status: (fm.status as NodeStatus) || 'not_started',
    parentId: (fm.parent as string) || null,
    collapsed: (fm.collapsed as boolean) || false,
    questions,
  }

  if (nodeContent) node.content = nodeContent
  if (prds.length > 0) node.prds = prds
  if (prompts.length > 0) node.prompts = prompts
  if (fm.priority) node.priority = fm.priority as Priority
  if (fm.assignee) node.assigneeId = fm.assignee as string
  if (fm.tags) node.tags = fm.tags as string[]
  if (fm.dueDate) node.dueDate = fm.dueDate as number
  if (fm.estimatedHours) node.estimatedHours = fm.estimatedHours as number
  if (fm.sprintId) node.sprintId = fm.sprintId as string
  if (fm.version) node.version = fm.version as string
  if (fm.schemaType) node.schemaType = fm.schemaType as PlanNode['schemaType']
  if (fm.promptType) node.promptType = fm.promptType as PlanNode['promptType']
  if (fm.targetTool) node.targetTool = fm.targetTool as PlanNode['targetTool']
  if (fm.referenceType) node.referenceType = fm.referenceType as PlanNode['referenceType']
  if (fm.url) node.url = fm.url as string
  if (fm.acceptanceCriteria) node.acceptanceCriteria = fm.acceptanceCriteria as string[]

  return node
}

// ── Serialize entire project to file tree ──

export interface TerritoryFile {
  path: string
  content: string
}

export function projectToTerritory(project: Project): TerritoryFile[] {
  const files: TerritoryFile[] = []

  // project.yaml — metadata + edges
  const projectMeta: Record<string, unknown> = {
    id: project.id,
    title: project.title,
    description: project.description,
    phase: project.phase,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }

  if (project.isPublic) projectMeta.isPublic = true
  if (project.shareId) projectMeta.shareId = project.shareId

  // Serialize edges
  const edges = project.edges
    .filter((e) => e.edgeType && e.edgeType !== 'hierarchy')
    .map((e) => ({
      source: e.source,
      target: e.target,
      type: e.edgeType,
      ...(e.label ? { label: e.label } : {}),
    }))

  if (edges.length > 0) {
    projectMeta.edges = edges
  }

  // Team
  if (project.team && project.team.length > 0) {
    projectMeta.team = project.team.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      color: m.color,
    }))
  }

  files.push({
    path: '.territory/project.yaml',
    content: serializeYaml(projectMeta),
  })

  // Node files
  for (const node of project.nodes) {
    const folder = TYPE_FOLDERS[node.type] || 'docs'
    files.push({
      path: `.territory/${folder}/${node.id}.md`,
      content: nodeToMarkdown(node),
    })
  }

  return files
}

// ── Deserialize file tree back to project data ──

export interface TerritoryParseResult {
  projectMeta: {
    id?: string
    title: string
    description: string
    phase?: string
    isPublic?: boolean
    shareId?: string
    team?: { id: string; name: string; email: string; color: string }[]
  }
  nodes: PlanNode[]
  dependencyEdges: ProjectEdge[]
}

export function territoryToProject(files: TerritoryFile[]): TerritoryParseResult {
  const nodes: PlanNode[] = []
  let projectMeta: TerritoryParseResult['projectMeta'] = {
    title: 'Imported Project',
    description: '',
  }
  const dependencyEdges: ProjectEdge[] = []

  for (const file of files) {
    if (file.path.endsWith('project.yaml')) {
      const meta = parseYaml(file.content)
      projectMeta = {
        id: meta.id as string | undefined,
        title: (meta.title as string) || 'Imported Project',
        description: (meta.description as string) || '',
        phase: meta.phase as string | undefined,
        isPublic: meta.isPublic as boolean | undefined,
        shareId: meta.shareId as string | undefined,
        team: meta.team as TerritoryParseResult['projectMeta']['team'],
      }

      // Parse edges
      const edges = (meta.edges || []) as { source: string; target: string; type: string; label?: string }[]
      for (const e of edges) {
        dependencyEdges.push({
          id: `${e.source}-${e.type}-${e.target}`,
          source: e.source,
          target: e.target,
          edgeType: e.type as ProjectEdge['edgeType'],
          label: e.label,
        })
      }
    } else if (file.path.endsWith('.md')) {
      const node = markdownToNode(file.content)
      if (node) nodes.push(node)
    }
  }

  return { projectMeta, nodes, dependencyEdges }
}

// ── Minimal YAML serializer (no dependency) ──

function serializeYaml(obj: Record<string, unknown>, indent = 0): string {
  const pad = '  '.repeat(indent)
  const lines: string[] = []

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue

    if (typeof value === 'string') {
      if (value.includes('\n') || value.includes(':') || value.includes('#')) {
        lines.push(`${pad}${key}: "${value.replace(/"/g, '\\"')}"`)
      } else {
        lines.push(`${pad}${key}: ${value}`)
      }
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      lines.push(`${pad}${key}: ${value}`)
    } else if (Array.isArray(value)) {
      if (value.length === 0) continue
      if (typeof value[0] === 'string') {
        lines.push(`${pad}${key}: [${value.map((v) => `"${v}"`).join(', ')}]`)
      } else {
        lines.push(`${pad}${key}:`)
        for (const item of value) {
          if (typeof item === 'object' && item !== null) {
            const itemLines = serializeYaml(item as Record<string, unknown>, indent + 2)
            const firstLine = itemLines.split('\n')[0]
            const restLines = itemLines.split('\n').slice(1)
            lines.push(`${pad}  - ${firstLine.trim()}`)
            for (const rl of restLines) {
              if (rl.trim()) lines.push(`${pad}    ${rl.trim()}`)
            }
          } else {
            lines.push(`${pad}  - ${item}`)
          }
        }
      }
    } else if (typeof value === 'object') {
      lines.push(`${pad}${key}:`)
      lines.push(serializeYaml(value as Record<string, unknown>, indent + 1))
    }
  }

  return lines.join('\n') + '\n'
}

// ── Minimal YAML parser (no dependency) ──

function parseYaml(text: string): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  const lines = text.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) { i++; continue }

    const kvMatch = trimmed.match(/^(\w[\w.-]*)\s*:\s*(.*)$/)
    if (!kvMatch) { i++; continue }

    const key = kvMatch[1]
    let value = kvMatch[2].trim()

    // Inline array: [a, b, c]
    if (value.startsWith('[') && value.endsWith(']')) {
      const inner = value.slice(1, -1)
      result[key] = inner.split(',').map((s) => {
        const t = s.trim()
        if (t.startsWith('"') && t.endsWith('"')) return t.slice(1, -1)
        if (t.startsWith("'") && t.endsWith("'")) return t.slice(1, -1)
        if (t === 'true') return true
        if (t === 'false') return false
        const n = Number(t)
        return isNaN(n) ? t : n
      })
      i++
      continue
    }

    // Block array or nested object
    if (value === '') {
      // Check if next line starts with "  -" (array) or "  key:" (object)
      const nextLine = lines[i + 1]?.trimStart()
      if (nextLine?.startsWith('- ')) {
        // Parse array
        const arr: unknown[] = []
        i++
        while (i < lines.length) {
          const arrLine = lines[i]
          if (!arrLine.trim() || (!arrLine.match(/^\s+-/) && !arrLine.match(/^\s+\w/))) break
          const itemMatch = arrLine.match(/^\s+-\s*(.*)$/)
          if (itemMatch) {
            const itemVal = itemMatch[1].trim()
            // Check if it's an object item (has key: value)
            const objMatch = itemVal.match(/^(\w[\w.-]*)\s*:\s*(.*)$/)
            if (objMatch) {
              const obj: Record<string, unknown> = {}
              obj[objMatch[1]] = parseScalar(objMatch[2].trim())
              i++
              // Collect continuation lines for this object
              while (i < lines.length) {
                const contLine = lines[i]
                if (!contLine.trim() || contLine.match(/^\s+-/)) break
                const contMatch = contLine.trim().match(/^(\w[\w.-]*)\s*:\s*(.*)$/)
                if (contMatch) {
                  obj[contMatch[1]] = parseScalar(contMatch[2].trim())
                  i++
                } else {
                  break
                }
              }
              arr.push(obj)
            } else {
              arr.push(parseScalar(itemVal))
              i++
            }
          } else {
            i++
          }
        }
        result[key] = arr
        continue
      } else {
        // Nested object — simplified: just skip for now
        i++
        continue
      }
    }

    // Scalar value
    result[key] = parseScalar(value)
    i++
  }

  return result
}

function parseScalar(s: string): string | number | boolean {
  if (s.startsWith('"') && s.endsWith('"')) return s.slice(1, -1)
  if (s.startsWith("'") && s.endsWith("'")) return s.slice(1, -1)
  if (s === 'true') return true
  if (s === 'false') return false
  if (s === 'null' || s === '') return ''
  const n = Number(s)
  return isNaN(n) ? s : n
}

// ── Export as a downloadable zip-like bundle (flat text for File System Access API) ──

export function territoryToZipContent(files: TerritoryFile[]): string {
  // For browser download, we produce a single concatenated file with markers
  // This is used as a fallback; primary export uses File System Access API
  const sections: string[] = []
  sections.push('# TinyBaguette Territory Export')
  sections.push(`# Generated: ${new Date().toISOString()}`)
  sections.push(`# Files: ${files.length}`)
  sections.push('')

  for (const file of files) {
    sections.push(`=== FILE: ${file.path} ===`)
    sections.push(file.content)
    sections.push(`=== END: ${file.path} ===`)
    sections.push('')
  }

  return sections.join('\n')
}

export function zipContentToTerritory(content: string): TerritoryFile[] {
  const files: TerritoryFile[] = []
  const regex = /=== FILE: (.+?) ===\n([\s\S]*?)=== END: .+? ===/g
  let match
  while ((match = regex.exec(content)) !== null) {
    files.push({
      path: match[1],
      content: match[2].trimEnd(),
    })
  }
  return files
}
