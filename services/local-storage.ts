import type { Project } from '@/types/project'

const STORAGE_KEY = 'visionpath_projects'
const QUOTA_WARNING_BYTES = 4 * 1024 * 1024 // 4 MB

function readAll(): Record<string, Project> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeAll(data: Record<string, Project>) {
  const json = JSON.stringify(data)
  if (json.length > QUOTA_WARNING_BYTES) {
    console.warn(
      `[local-storage] Data size (${(json.length / 1024 / 1024).toFixed(1)} MB) is approaching the ~5 MB localStorage limit.`
    )
  }
  localStorage.setItem(STORAGE_KEY, json)
}

function normalizeProject(p: Project): Project {
  return {
    ...p,
    nodes: p.nodes.map((n) => ({
      ...n,
      questions: (n.questions ?? []).map((q) => ({
        ...q,
        answer: q.answer ?? '',
      })),
    })),
  }
}

export async function getProjects(userId: string): Promise<Project[]> {
  const all = readAll()
  return Object.values(all)
    .filter((p) => p.userId === userId)
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function getProject(id: string): Promise<Project | null> {
  const all = readAll()
  const p = all[id]
  return p ? normalizeProject(p) : null
}

export async function createProject(project: Project): Promise<void> {
  const all = readAll()
  all[project.id] = project
  writeAll(all)
}

export async function updateProject(
  id: string,
  data: Partial<Omit<Project, 'id'>>
): Promise<void> {
  const all = readAll()
  const existing = all[id]
  if (!existing) return
  all[id] = { ...existing, ...data, updatedAt: Date.now() }
  writeAll(all)
}

export async function deleteProject(id: string): Promise<void> {
  const all = readAll()
  delete all[id]
  writeAll(all)
}
