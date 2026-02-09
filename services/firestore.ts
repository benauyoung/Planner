
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Project } from '@/types/project'

const PROJECTS_COLLECTION = 'projects'

export async function getProjects(userId: string): Promise<Project[]> {
  if (!db) return []
  const q = query(
    collection(db, PROJECTS_COLLECTION),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Project))
}

export async function getProject(id: string): Promise<Project | null> {
  if (!db) return null
  const docRef = doc(db, PROJECTS_COLLECTION, id)
  const snapshot = await getDoc(docRef)
  if (!snapshot.exists()) return null
  const data = { id: snapshot.id, ...snapshot.data() } as Project
  // Ensure backward compat: nodes without questions get empty array
  data.nodes = data.nodes.map((n) => ({
    ...n,
    questions: n.questions ?? [],
  }))
  return data
}

export async function createProject(project: Project): Promise<void> {
  if (!db) return
  const docRef = doc(db, PROJECTS_COLLECTION, project.id)
  await setDoc(docRef, project)
}

export async function updateProject(
  id: string,
  data: Partial<Omit<Project, 'id'>>
): Promise<void> {
  if (!db) return
  const docRef = doc(db, PROJECTS_COLLECTION, id)
  await updateDoc(docRef, { ...data, updatedAt: Date.now() })
}

export async function deleteProject(id: string): Promise<void> {
  if (!db) return
  const docRef = doc(db, PROJECTS_COLLECTION, id)
  await deleteDoc(docRef)
}
