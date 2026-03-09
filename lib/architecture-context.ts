import type { Project, ArchitectureDecision } from '@/types/project'

const CATEGORY_LABELS: Record<string, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Database',
  auth: 'Authentication',
  deployment: 'Deployment',
  state_management: 'State Management',
  api_design: 'API Design',
  file_structure: 'File Structure',
  testing: 'Testing',
  third_party: 'Third-Party Services',
  caching: 'Caching',
  other: 'Other',
}

export function buildArchitectureContext(project: Project): string {
  const sections: string[] = []

  // Project info
  sections.push(`PROJECT: ${project.title}`)
  if (project.description) {
    sections.push(`DESCRIPTION: ${project.description}`)
  }

  // Node hierarchy
  if (project.nodes.length > 0) {
    const nodeLines = project.nodes.map((n) => {
      const indent = n.parentId ? '  ' : ''
      const desc = n.description ? `: ${n.description}` : ''
      return `${indent}- [${n.type}] ${n.title}${desc}`
    })
    sections.push(`\nPROJECT STRUCTURE:\n${nodeLines.join('\n')}`)
  }

  // Tech keywords from Q&A answers
  const techKeywords = new Set<string>()
  const techRegex = /\b(React|Next\.?js|Vue|Angular|Svelte|Remix|Astro|Node\.?js|Express|FastAPI|Django|Rails|Spring|Go|Rust|Python|TypeScript|JavaScript|PostgreSQL|MySQL|MongoDB|Redis|SQLite|Supabase|Firebase|AWS|GCP|Azure|Vercel|Netlify|Docker|Kubernetes|GraphQL|REST|tRPC|Prisma|Drizzle|Tailwind|SCSS|Zustand|Redux|Jotai|Stripe|Auth0|Clerk|NextAuth|OAuth|JWT|Vitest|Jest|Playwright|Cypress)\b/gi
  for (const node of project.nodes) {
    for (const q of node.questions) {
      if (q.answer) {
        const matches = q.answer.match(techRegex)
        if (matches) matches.forEach((m) => techKeywords.add(m))
      }
    }
  }
  if (techKeywords.size > 0) {
    sections.push(`\nTECH MENTIONED IN Q&A: ${Array.from(techKeywords).join(', ')}`)
  }

  // Existing architecture decisions
  const decisions = project.architectureDecisions || []
  if (decisions.length > 0) {
    const grouped = new Map<string, ArchitectureDecision[]>()
    for (const d of decisions) {
      const list = grouped.get(d.category) || []
      list.push(d)
      grouped.set(d.category, list)
    }
    const lines: string[] = []
    for (const [cat, decs] of grouped) {
      lines.push(`\n### ${CATEGORY_LABELS[cat] || cat}`)
      for (const d of decs) {
        lines.push(`- [${d.status}] ${d.title}: ${d.description}`)
      }
    }
    sections.push(`\nEXISTING ARCHITECTURE DECISIONS:${lines.join('\n')}`)
  }

  return sections.join('\n')
}
