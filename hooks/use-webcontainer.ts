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
        await writeFile(file.path, file.content)
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
