import { db } from './firebase'
import * as firestoreService from './firestore'
import * as localStorageService from './local-storage'
import type { Project } from '@/types/project'

let useFirestore = Boolean(db)
let failedOver = false

export const isFirebaseActive = Boolean(db)

function withFallback<T extends unknown[], R>(
  firestoreFn: (...args: T) => Promise<R>,
  localFn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    if (!useFirestore) return localFn(...args)
    try {
      return await firestoreFn(...args)
    } catch (err) {
      if (!failedOver) {
        failedOver = true
        useFirestore = false
        console.warn(
          '[persistence] Firestore unavailable, falling back to localStorage.',
          err
        )
      }
      return localFn(...args)
    }
  }
}

export const getProjects = withFallback<[string], Project[]>(
  firestoreService.getProjects,
  localStorageService.getProjects
)
export const getProject = withFallback<[string], Project | null>(
  firestoreService.getProject,
  localStorageService.getProject
)
export const createProject = withFallback<[Project], void>(
  firestoreService.createProject,
  localStorageService.createProject
)
export const updateProject = withFallback<[string, Partial<Omit<Project, 'id'>>], void>(
  firestoreService.updateProject,
  localStorageService.updateProject
)
export const deleteProject = withFallback<[string], void>(
  firestoreService.deleteProject,
  localStorageService.deleteProject
)
