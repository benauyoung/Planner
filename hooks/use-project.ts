'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useProjectStore } from '@/stores/project-store'
import * as firestore from '@/services/persistence'
import type { Project } from '@/types/project'

export function useProject(projectId?: string) {
  const {
    currentProject,
    projects,
    setCurrentProject,
    setProjects,
  } = useProjectStore()

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedRef = useRef<string>('')

  // Load project by ID
  useEffect(() => {
    if (!projectId) return

    async function load() {
      try {
        const project = await firestore.getProject(projectId!)
        if (project) {
          setCurrentProject(project)
          lastSavedRef.current = JSON.stringify(project)
        }
      } catch (err) {
        console.error('Failed to load project:', err)
      }
    }
    load()
  }, [projectId, setCurrentProject])

  // Load all projects for a given user
  const loadProjects = useCallback(async (userId: string) => {
    try {
      const all = await firestore.getProjects(userId)
      setProjects(all)
    } catch (err) {
      console.error('Failed to load projects:', err)
    }
  }, [setProjects])

  // Auto-save with debounce
  useEffect(() => {
    if (!currentProject) return

    const serialized = JSON.stringify(currentProject)
    if (serialized === lastSavedRef.current) return

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await firestore.updateProject(currentProject.id, {
          title: currentProject.title,
          description: currentProject.description,
          phase: currentProject.phase,
          nodes: currentProject.nodes,
          edges: currentProject.edges,
        })
        lastSavedRef.current = serialized
      } catch (err) {
        console.error('Auto-save failed:', err)
      }
    }, 2000)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [currentProject])

  const saveProject = useCallback(
    async (project: Project) => {
      try {
        await firestore.createProject(project)
        lastSavedRef.current = JSON.stringify(project)
      } catch (err) {
        console.error('Failed to save project:', err)
      }
    },
    []
  )

  const removeProject = useCallback(
    async (id: string) => {
      try {
        await firestore.deleteProject(id)
        useProjectStore.getState().removeProject(id)
      } catch (err) {
        console.error('Failed to delete project:', err)
      }
    },
    []
  )

  return {
    currentProject,
    projects,
    loadProjects,
    saveProject,
    removeProject,
  }
}
