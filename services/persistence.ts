import { db } from './firebase'
import * as firestoreService from './firestore'
import * as localStorageService from './local-storage'

const backend = db ? firestoreService : localStorageService

export const isFirebaseActive = Boolean(db)

export const getProjects = backend.getProjects
export const getProject = backend.getProject
export const createProject = backend.createProject
export const updateProject = backend.updateProject
export const deleteProject = backend.deleteProject
