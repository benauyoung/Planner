import type { Project } from '@/types/project'
import { generateId } from './id'

const EXPORT_VERSION = 1

interface ExportedProject {
  _visionpath: {
    version: number
    exportedAt: string
  }
  project: Project
}

/**
 * Export a project as a downloadable JSON string.
 */
export function exportProjectAsJSON(project: Project): string {
  const exported: ExportedProject = {
    _visionpath: {
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
    },
    project,
  }
  return JSON.stringify(exported, null, 2)
}

/**
 * Parse and validate an imported JSON string into a Project.
 * Assigns a new project ID to avoid collisions.
 */
export function importProjectFromJSON(json: string, userId: string): Project {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error('Invalid JSON file')
  }

  // Handle VisionPath export format
  if (
    parsed &&
    typeof parsed === 'object' &&
    '_visionpath' in parsed &&
    'project' in parsed
  ) {
    const exported = parsed as ExportedProject
    return rehydrateProject(exported.project, userId)
  }

  // Handle raw Project object
  if (parsed && typeof parsed === 'object' && 'nodes' in parsed && 'title' in parsed) {
    return rehydrateProject(parsed as Project, userId)
  }

  throw new Error('Unrecognized file format. Expected a VisionPath project export.')
}

function rehydrateProject(raw: Project, userId: string): Project {
  if (!Array.isArray(raw.nodes)) {
    throw new Error('Project is missing nodes array')
  }

  return {
    ...raw,
    id: generateId(),
    userId,
    phase: raw.phase || 'active',
    edges: raw.edges || [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    nodes: raw.nodes.map((n) => ({
      ...n,
      questions: (n.questions ?? []).map((q) => ({
        ...q,
        answer: q.answer ?? '',
      })),
      collapsed: n.collapsed ?? false,
      prds: n.prds ?? [],
      prompts: n.prompts ?? [],
      images: n.images ?? [],
    })),
  }
}

/**
 * Trigger a file download in the browser.
 */
export function downloadFile(content: string, filename: string, mimeType = 'application/json') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Read a File object as text.
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
