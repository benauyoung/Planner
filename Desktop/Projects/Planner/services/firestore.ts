import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Project } from '@/types/project'

const PROJECTS_COLLECTION = 'projects'

export async function getProjects(): Promise<Project[]> {
  const q = query(collection(db, PROJECTS_COLLECTION), orderBy('updatedAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Project))
}

export async function getProject(id: string): Promise<Project | null> {
  const docRef = doc(db, PROJECTS_COLLECTION, id)
  const snapshot = await getDoc(docRef)
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() } as Project
}

export async function createProject(project: Project): Promise<void> {
  const docRef = doc(db, PROJECTS_COLLECTION, project.id)
  await setDoc(docRef, project)
}

export async function updateProject(
  id: string,
  data: Partial<Omit<Project, 'id'>>
): Promise<void> {
  const docRef = doc(db, PROJECTS_COLLECTION, id)
  await updateDoc(docRef, { ...data, updatedAt: Date.now() })
}

export async function deleteProject(id: string): Promise<void> {
  const docRef = doc(db, PROJECTS_COLLECTION, id)
  await deleteDoc(docRef)
}
