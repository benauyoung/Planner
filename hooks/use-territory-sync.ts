'use client'

import { useState, useCallback } from 'react'
import { useProjectStore } from '@/stores/project-store'
import {
  projectToTerritory,
  territoryToProject,
  territoryToZipContent,
  zipContentToTerritory,
  type TerritoryFile,
} from '@/lib/territory-serialize'
import {
  diffTerritoryToCanvas,
  applyMerge,
  type SyncDiff,
} from '@/lib/territory-sync'

export type SyncStatus = 'idle' | 'exporting' | 'importing' | 'diffing' | 'merging' | 'done' | 'error'

export interface UseTerritorySync {
  status: SyncStatus
  error: string | null
  diff: SyncDiff | null

  /** Export current project to .territory files (downloads as single bundle) */
  exportTerritory: () => Promise<void>

  /** Export using File System Access API (writes real folder) */
  exportTerritoryToFolder: () => Promise<void>

  /** Import from uploaded .territory bundle file */
  importTerritory: (file: File) => Promise<void>

  /** Import from folder via File System Access API */
  importTerritoryFromFolder: () => Promise<void>

  /** After import/diff, apply the merge */
  applyDiff: (acceptedIds?: Set<string>) => void

  /** Clear diff state */
  clearDiff: () => void
}

export function useTerritorySync(): UseTerritorySync {
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [diff, setDiff] = useState<SyncDiff | null>(null)
  const [pendingFiles, setPendingFiles] = useState<TerritoryFile[]>([])

  // ── Export as downloadable bundle ──
  const exportTerritory = useCallback(async () => {
    const project = useProjectStore.getState().currentProject
    if (!project) { setError('No project open'); return }

    setStatus('exporting')
    setError(null)

    try {
      const files = projectToTerritory(project)
      const content = territoryToZipContent(files)

      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${project.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.territory`
      a.click()
      URL.revokeObjectURL(url)

      setStatus('done')
      setTimeout(() => setStatus('idle'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
      setStatus('error')
    }
  }, [])

  // ── Export using File System Access API (real folder) ──
  const exportTerritoryToFolder = useCallback(async () => {
    const project = useProjectStore.getState().currentProject
    if (!project) { setError('No project open'); return }

    if (!('showDirectoryPicker' in window)) {
      setError('File System Access API not supported in this browser. Use the bundle export instead.')
      setStatus('error')
      return
    }

    setStatus('exporting')
    setError(null)

    try {
      const dirHandle = await (window as unknown as { showDirectoryPicker: (opts?: object) => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker({ mode: 'readwrite' })
      const files = projectToTerritory(project)

      for (const file of files) {
        const parts = file.path.split('/')
        let currentDir = dirHandle

        // Create subdirectories
        for (let i = 0; i < parts.length - 1; i++) {
          currentDir = await currentDir.getDirectoryHandle(parts[i], { create: true })
        }

        // Write file
        const fileName = parts[parts.length - 1]
        const fileHandle = await currentDir.getFileHandle(fileName, { create: true })
        const writable = await fileHandle.createWritable()
        await writable.write(file.content)
        await writable.close()
      }

      setStatus('done')
      setTimeout(() => setStatus('idle'), 2000)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setStatus('idle')
        return
      }
      setError(err instanceof Error ? err.message : 'Export to folder failed')
      setStatus('error')
    }
  }, [])

  // ── Import from uploaded bundle file ──
  const importTerritory = useCallback(async (file: File) => {
    setStatus('importing')
    setError(null)

    try {
      const text = await file.text()
      const files = zipContentToTerritory(text)

      if (files.length === 0) {
        setError('No valid territory files found in bundle')
        setStatus('error')
        return
      }

      const parsed = territoryToProject(files)
      const project = useProjectStore.getState().currentProject

      if (!project) {
        setError('No project open to merge into')
        setStatus('error')
        return
      }

      setStatus('diffing')
      const syncDiff = diffTerritoryToCanvas(
        project.nodes,
        project.edges,
        parsed.nodes,
        parsed.dependencyEdges
      )

      setDiff(syncDiff)
      setPendingFiles(files)
      setStatus('idle')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
      setStatus('error')
    }
  }, [])

  // ── Import from folder via File System Access API ──
  const importTerritoryFromFolder = useCallback(async () => {
    if (!('showDirectoryPicker' in window)) {
      setError('File System Access API not supported in this browser. Use the bundle import instead.')
      setStatus('error')
      return
    }

    setStatus('importing')
    setError(null)

    try {
      const dirHandle = await (window as unknown as { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker()
      const files: TerritoryFile[] = []

      await readDirectoryRecursive(dirHandle, '', files)

      if (files.length === 0) {
        setError('No territory files found in selected folder')
        setStatus('error')
        return
      }

      const parsed = territoryToProject(files)
      const project = useProjectStore.getState().currentProject

      if (!project) {
        setError('No project open to merge into')
        setStatus('error')
        return
      }

      setStatus('diffing')
      const syncDiff = diffTerritoryToCanvas(
        project.nodes,
        project.edges,
        parsed.nodes,
        parsed.dependencyEdges
      )

      setDiff(syncDiff)
      setPendingFiles(files)
      setStatus('idle')
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setStatus('idle')
        return
      }
      setError(err instanceof Error ? err.message : 'Import from folder failed')
      setStatus('error')
    }
  }, [])

  // ── Apply the diff ──
  const applyDiff = useCallback((acceptedIds?: Set<string>) => {
    if (!diff) return

    const project = useProjectStore.getState().currentProject
    if (!project) return

    setStatus('merging')

    try {
      const { nodes, edges } = applyMerge(project.nodes, project.edges, diff, acceptedIds)

      // Update the project store
      useProjectStore.getState().setFlowNodes(
        nodes.map((n) => ({
          id: n.id,
          type: n.type,
          position: { x: 0, y: 0 }, // Will be re-laid out
          data: {
            label: n.title,
            description: n.description,
            nodeType: n.type,
            status: n.status,
            collapsed: n.collapsed,
            parentId: n.parentId,
            questionsTotal: n.questions?.length || 0,
            questionsAnswered: n.questions?.filter((q) => q.answer).length || 0,
          },
        }))
      )

      // Also update the underlying project nodes directly
      useProjectStore.getState().mergeFromTerritory(nodes, edges)

      setDiff(null)
      setPendingFiles([])
      setStatus('done')
      setTimeout(() => setStatus('idle'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Merge failed')
      setStatus('error')
    }
  }, [diff])

  const clearDiff = useCallback(() => {
    setDiff(null)
    setPendingFiles([])
    setStatus('idle')
    setError(null)
  }, [])

  return {
    status,
    error,
    diff,
    exportTerritory,
    exportTerritoryToFolder,
    importTerritory,
    importTerritoryFromFolder,
    applyDiff,
    clearDiff,
  }
}

// ── Helpers ──

async function readDirectoryRecursive(
  dirHandle: FileSystemDirectoryHandle,
  basePath: string,
  files: TerritoryFile[]
): Promise<void> {
  // FileSystemDirectoryHandle.values() is part of the File System Access API
  // but not fully typed in all TS libs — cast to AsyncIterable
  const entries = (dirHandle as unknown as { values(): AsyncIterable<FileSystemHandle & { kind: string; name: string }> }).values()
  for await (const entry of entries) {
    const entryPath = basePath ? `${basePath}/${entry.name}` : entry.name

    if (entry.kind === 'file') {
      const fileHandle = entry as FileSystemFileHandle
      const file = await fileHandle.getFile()
      const content = await file.text()
      files.push({ path: entryPath, content })
    } else if (entry.kind === 'directory') {
      const subDir = entry as unknown as FileSystemDirectoryHandle
      await readDirectoryRecursive(subDir, entryPath, files)
    }
  }
}
