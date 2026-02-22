'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  bootWebContainer,
  writeFiles,
  writeFile,
  installDeps,
  startDevServer,
  teardown,
  onStateChange,
  isWebContainerSupported,
  type WebContainerState,
  type WebContainerStatus,
} from '@/services/webcontainer'
import { BASE_TEMPLATE } from '@/lib/webcontainer-template'

/**
 * Strip BrowserRouter / HashRouter from AI-generated files.
 * main.tsx already provides <BrowserRouter>, so any additional
 * router wrapper causes a fatal "cannot render Router inside Router" crash.
 */
function sanitizeRouterImports(path: string, content: string): string {
  // Only process .tsx/.jsx files
  if (!/\.[jt]sx?$/.test(path)) return content
  // Never touch main.tsx — that's our canonical router provider
  if (path.endsWith('main.tsx')) return content

  let result = content

  // Remove BrowserRouter / HashRouter from import statements
  // e.g. import { BrowserRouter, Routes, Route } from 'react-router-dom'
  result = result.replace(
    /import\s*\{([^}]*)\}\s*from\s*['"]react-router-dom['"]/g,
    (_match, imports: string) => {
      const cleaned = imports
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s && s !== 'BrowserRouter' && s !== 'HashRouter')
      if (cleaned.length === 0) return '// removed: duplicate router import'
      return `import { ${cleaned.join(', ')} } from 'react-router-dom'`
    }
  )

  // Remove <BrowserRouter> and </BrowserRouter> wrapper tags (and HashRouter)
  result = result.replace(/<BrowserRouter>/g, '')
  result = result.replace(/<\/BrowserRouter>/g, '')
  result = result.replace(/<HashRouter>/g, '')
  result = result.replace(/<\/HashRouter>/g, '')

  return result
}

export interface UseWebContainerReturn {
  status: WebContainerStatus
  error: string | null
  serverUrl: string | null
  logs: string[]
  supported: boolean
  boot: () => Promise<void>
  writeAppFiles: (files: { path: string; content: string }[]) => Promise<void>
  restart: () => Promise<void>
}

export function useWebContainer(): UseWebContainerReturn {
  const [state, setState] = useState<WebContainerState>({
    status: 'idle',
    error: null,
    serverUrl: null,
    logs: [],
  })

  const [supported] = useState(() =>
    typeof window !== 'undefined' ? isWebContainerSupported() : false
  )

  const serverUrlRef = useRef<string | null>(null)
  const bootedRef = useRef(false)

  useEffect(() => {
    const unsub = onStateChange((newState) => {
      setState(newState)
      serverUrlRef.current = newState.serverUrl
    })
    return unsub
  }, [])

  const boot = useCallback(async () => {
    if (bootedRef.current) return
    bootedRef.current = true

    try {
      await bootWebContainer()
      await writeFiles(BASE_TEMPLATE)
      await installDeps()
      await startDevServer()
    } catch (err) {
      bootedRef.current = false
      console.error('WebContainer boot failed:', err)
    }
  }, [])

  const writeAppFiles = useCallback(
    async (files: { path: string; content: string }[]) => {
      for (const file of files) {
        const content = sanitizeRouterImports(file.path, file.content)
        await writeFile(file.path, content)
      }
    },
    []
  )

  const restart = useCallback(async () => {
    bootedRef.current = false
    await teardown()
    await boot()
  }, [boot])

  return {
    status: state.status,
    error: state.error,
    serverUrl: state.serverUrl,
    logs: state.logs,
    supported,
    boot,
    writeAppFiles,
    restart,
  }
}
