import JSZip from 'jszip'
import type { Project, PlanNode, NodePRD } from '@/types/project'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toSlug(type: string, title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
  return `${type}-${slug}`
}

function getOrderedPrdNodes(project: Project): { node: PlanNode; prd: NodePRD; slug: string }[] {
  const PRD_TYPES = new Set(['goal', 'subgoal', 'feature', 'task'])
  const slugCounts = new Map<string, number>()
  const results: { node: PlanNode; prd: NodePRD; slug: string }[] = []

  // BFS order preserves hierarchy
  const queue: string[] = project.nodes
    .filter((n) => n.parentId === null)
    .map((n) => n.id)
  const visited = new Set<string>()

  while (queue.length > 0) {
    const id = queue.shift()!
    if (visited.has(id)) continue
    visited.add(id)

    const node = project.nodes.find((n) => n.id === id)
    if (!node) continue

    if (PRD_TYPES.has(node.type) && node.prds && node.prds.length > 0) {
      // Use the most recent PRD
      const prd = [...node.prds].sort((a, b) => b.updatedAt - a.updatedAt)[0]
      const base = toSlug(node.type, node.title)
      const count = slugCounts.get(base) ?? 0
      slugCounts.set(base, count + 1)
      const slug = count === 0 ? base : `${base}-${count + 1}`
      results.push({ node, prd, slug })
    }

    // Enqueue children
    const children = project.nodes
      .filter((n) => n.parentId === id)
      .map((n) => n.id)
    queue.push(...children)
  }

  return results
}

const TECH_PATTERN =
  /\b(react|next\.?js|nextauth|firebase|firestore|postgres|postgresql|mysql|mongodb|prisma|drizzle|tailwind|typescript|graphql|trpc|redis|stripe|resend|vercel|supabase|clerk|auth\.?js|express|fastapi|django|rails|vue|nuxt|angular|svelte|remix|astro|bun|deno|node\.?js|docker|kubernetes|aws|gcp|azure)\b/gi

function extractTechDecisions(project: Project): string[] {
  const seen = new Set<string>()
  for (const node of project.nodes) {
    for (const q of node.questions ?? []) {
      const matches = q.answer.match(TECH_PATTERN) ?? []
      for (const m of matches) seen.add(m.toLowerCase())
    }
  }
  return Array.from(seen).sort()
}

function recommendAgent(techStack: string[]): string {
  if (techStack.some((t) => ['cursor', 'windsurf'].includes(t))) return 'cursor'
  if (techStack.includes('claude')) return 'claude'
  // Default: cursor is best for file-heavy tasks
  return 'cursor'
}

// ---------------------------------------------------------------------------
// File generators
// ---------------------------------------------------------------------------

function buildPrdFile(node: PlanNode, prd: NodePRD, slug: string): string {
  const answeredQA = node.questions.filter((q) => q.answer)
  const qaBlock =
    answeredQA.length > 0
      ? answeredQA.map((q) => `  - q: "${q.question.replace(/"/g, "'")}"\n    a: "${q.answer.replace(/"/g, "'")}"`).join('\n')
      : '  []'

  const frontmatter = [
    '---',
    `id: "${node.id}"`,
    `type: "${node.type}"`,
    `title: "${prd.title.replace(/"/g, "'")}"`,
    `slug: "${slug}"`,
    `status: "${node.status}"`,
    `updated: "${new Date(prd.updatedAt).toISOString().split('T')[0]}"`,
    `qa:`,
    qaBlock,
    '---',
    '',
  ].join('\n')

  return frontmatter + prd.content
}

function generatePrdReadme(
  project: Project,
  entries: { node: PlanNode; prd: NodePRD; slug: string }[]
): string {
  const lines = [
    `# ${project.title} — PRD Index`,
    '',
    `Generated: ${new Date().toISOString().split('T')[0]}  `,
    `Nodes with PRDs: ${entries.length}`,
    '',
    '## PRDs',
    '',
  ]

  const byType: Record<string, typeof entries> = {}
  for (const e of entries) {
    ;(byType[e.node.type] ??= []).push(e)
  }

  for (const [type, items] of Object.entries(byType)) {
    lines.push(`### ${type.charAt(0).toUpperCase() + type.slice(1)}s`)
    for (const { prd, slug } of items) {
      lines.push(`- [${prd.title}](./${slug}.md)`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

function generateRalphyConfig(
  project: Project,
  entries: { node: PlanNode; prd: NodePRD; slug: string }[],
  techStack: string[]
): string {
  const agent = recommendAgent(techStack)
  const date = new Date().toISOString().split('T')[0]
  const hasPending = project.nodes.filter(
    (n) =>
      ['goal', 'subgoal', 'feature', 'task'].includes(n.type) &&
      (!n.prds || n.prds.length === 0)
  )

  const prdList = entries.map(({ node, slug }) => `  - prd/${slug}.md  # [${node.type}] ${node.title}`).join('\n')
  const pendingList = hasPending.map((n) => `  - "[${n.type}] ${n.title}"`).join('\n')
  const techList = techStack.length > 0 ? techStack.map((t) => `  - ${t}`).join('\n') : '  []'

  return [
    `project: "${project.title}"`,
    `description: "${(project.description || '').replace(/"/g, "'").slice(0, 200)}"`,
    `generated: "${date}"`,
    `agent: ${agent}`,
    '',
    'tech:',
    techList,
    '',
    'rules:',
    '  - "Only modify files within the boundary specified in each PRD"',
    '  - "Complete all checklist items in a PRD before moving to the next"',
    '  - "Do not modify files listed in Do not modify sections"',
    '  - "Run tests after each PRD is completed"',
    '',
    'prds:',
    prdList || '  []',
    '',
    ...(hasPending.length > 0
      ? ['pending_prds:', pendingList, '']
      : []),
  ].join('\n')
}

function generateFlatPrdMd(
  project: Project,
  entries: { node: PlanNode; prd: NodePRD; slug: string }[]
): string {
  const lines = [
    `# ${project.title} — Complete PRD`,
    '',
    `> Generated by TinyBaguette on ${new Date().toISOString().split('T')[0]}`,
    `> ${entries.length} PRDs across ${project.nodes.length} nodes`,
    '',
    '---',
    '',
  ]

  for (const { node, prd, slug } of entries) {
    lines.push(`<!-- prd:${node.id} slug:${slug} -->`)
    lines.push(prd.content)
    lines.push('')
    lines.push('---')
    lines.push('')
  }

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function downloadRalphyZip(project: Project): Promise<void> {
  const entries = getOrderedPrdNodes(project)
  const techStack = extractTechDecisions(project)

  const zip = new JSZip()

  // .ralphy/config.yaml
  zip.file('.ralphy/config.yaml', generateRalphyConfig(project, entries, techStack))

  // PRD.md — flat concatenated
  zip.file('PRD.md', generateFlatPrdMd(project, entries))

  // prd/README.md
  zip.file('prd/README.md', generatePrdReadme(project, entries))

  // prd/<slug>.md — one file per PRD
  for (const { node, prd, slug } of entries) {
    zip.file(`prd/${slug}.md`, buildPrdFile(node, prd, slug))
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const safeName = project.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()
  a.href = url
  a.download = `${safeName}-ralphy.zip`
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadFlatPrdMd(project: Project): void {
  const entries = getOrderedPrdNodes(project)
  const content = generateFlatPrdMd(project, entries)
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const safeName = project.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()
  a.href = url
  a.download = `${safeName}-prd.md`
  a.click()
  URL.revokeObjectURL(url)
}
