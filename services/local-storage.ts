import type { Project } from '@/types/project'

const DB_NAME = 'tinybaguette'
const DB_VERSION = 1
const STORE_NAME = 'projects'

// Legacy localStorage key (for migration)
const LEGACY_STORAGE_KEY = 'tinybaguette_projects'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function tx(mode: IDBTransactionMode): Promise<{ store: IDBObjectStore; done: Promise<void> }> {
  return openDB().then((db) => {
    const transaction = db.transaction(STORE_NAME, mode)
    const store = transaction.objectStore(STORE_NAME)
    const done = new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
    return { store, done }
  })
}

function idbGet<T>(store: IDBObjectStore, key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const req = store.get(key)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function idbGetAll<T>(store: IDBObjectStore): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
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

/**
 * Migrate legacy localStorage data to IndexedDB (runs once).
 */
async function migrateLegacyData(): Promise<void> {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return

    const projects: Record<string, Project> = JSON.parse(raw)
    const { store, done } = await tx('readwrite')

    for (const project of Object.values(projects)) {
      store.put(project)
    }

    await done
    localStorage.removeItem(LEGACY_STORAGE_KEY)
    console.info('[storage] Migrated localStorage data to IndexedDB')
  } catch (err) {
    console.warn('[storage] Legacy migration failed:', err)
  }
}

// Run migration on module load (client-side only)
if (typeof window !== 'undefined') {
  migrateLegacyData()
}

export async function getProjects(userId: string): Promise<Project[]> {
  const { store } = await tx('readonly')
  const all = await idbGetAll<Project>(store)
  return all
    .filter((p) => p.userId === userId)
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function getProject(id: string): Promise<Project | null> {
  const { store } = await tx('readonly')
  const p = await idbGet<Project>(store, id)
  return p ? normalizeProject(p) : null
}

export async function createProject(project: Project): Promise<void> {
  const { store, done } = await tx('readwrite')
  store.put(project)
  await done
}

export async function updateProject(
  id: string,
  data: Partial<Omit<Project, 'id'>>
): Promise<void> {
  const { store, done } = await tx('readwrite')
  const existing = await idbGet<Project>(store, id)
  if (!existing) return
  store.put({ ...existing, ...data, updatedAt: Date.now() })
  await done
}

export async function deleteProject(id: string): Promise<void> {
  const { store, done } = await tx('readwrite')
  store.delete(id)
  await done
}
