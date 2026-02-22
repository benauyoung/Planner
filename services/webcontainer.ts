import { WebContainer, type FileSystemTree } from '@webcontainer/api'

// ─── Types ───────────────────────────────────────────────────

export type WebContainerStatus =
  | 'idle'
  | 'booting'
  | 'installing'
  | 'starting'
  | 'ready'
  | 'error'

export interface WebContainerState {
  status: WebContainerStatus
  error: string | null
  serverUrl: string | null
  logs: string[]
}

type StatusListener = (state: WebContainerState) => void

// ─── Singleton ───────────────────────────────────────────────

let instance: WebContainer | null = null
let bootPromise: Promise<WebContainer> | null = null

const state: WebContainerState = {
  status: 'idle',
  error: null,
  serverUrl: null,
  logs: [],
}

const listeners = new Set<StatusListener>()

function emit() {
  const snapshot = { ...state, logs: [...state.logs] }
  listeners.forEach((fn) => fn(snapshot))
}

function log(msg: string) {
  state.logs.push(msg)
  emit()
}

function setStatus(status: WebContainerStatus, error?: string) {
  state.status = status
  if (error !== undefined) state.error = error
  emit()
}

// ─── Public API ──────────────────────────────────────────────

export function onStateChange(listener: StatusListener): () => void {
  listeners.add(listener)
  listener({ ...state, logs: [...state.logs] })
  return () => listeners.delete(listener)
}

export function getWebContainerState(): WebContainerState {
  return { ...state, logs: [...state.logs] }
}

export function isWebContainerSupported(): boolean {
  if (typeof window === 'undefined') return false
  return 'SharedArrayBuffer' in window
}

export async function bootWebContainer(): Promise<WebContainer> {
  if (instance) return instance

  if (bootPromise) return bootPromise

  if (!isWebContainerSupported()) {
    const msg = 'WebContainer requires Cross-Origin Isolation (SharedArrayBuffer). Check browser compatibility.'
    setStatus('error', msg)
    throw new Error(msg)
  }

  bootPromise = (async () => {
    try {
      setStatus('booting')
      log('Booting WebContainer...')

      const wc = await WebContainer.boot()
      instance = wc

      log('WebContainer booted successfully.')
      return wc
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to boot WebContainer'
      setStatus('error', msg)
      log(`Boot error: ${msg}`)
      bootPromise = null
      throw err
    }
  })()

  return bootPromise
}

export async function writeFiles(files: FileSystemTree): Promise<void> {
  const wc = await bootWebContainer()
  await wc.mount(files)
  log(`Mounted file tree.`)
}

async function ensureDir(wc: WebContainer, dirPath: string): Promise<void> {
  const parts = dirPath.split('/').filter(Boolean)
  let current = ''
  for (const part of parts) {
    current = current ? `${current}/${part}` : part
    try {
      await wc.fs.readdir(current)
    } catch {
      await wc.fs.mkdir(current)
    }
  }
}

export async function writeFile(path: string, content: string): Promise<void> {
  const wc = await bootWebContainer()
  // Ensure parent directories exist
  const lastSlash = path.lastIndexOf('/')
  if (lastSlash > 0) {
    await ensureDir(wc, path.slice(0, lastSlash))
  }
  await wc.fs.writeFile(path, content)
  log(`Wrote file: ${path}`)
}

export async function readFile(path: string): Promise<string> {
  const wc = await bootWebContainer()
  return await wc.fs.readFile(path, 'utf-8')
}

export async function installDeps(): Promise<void> {
  const wc = await bootWebContainer()
  setStatus('installing')
  log('Installing dependencies (npm install)...')

  const installProcess = await wc.spawn('npm', ['install', '--prefer-offline', '--no-audit', '--no-fund'])

  installProcess.output.pipeTo(
    new WritableStream({
      write(chunk) {
        log(chunk)
      },
    })
  )

  const exitCode = await installProcess.exit
  if (exitCode !== 0) {
    const msg = `npm install failed with exit code ${exitCode}`
    setStatus('error', msg)
    throw new Error(msg)
  }

  log('Dependencies installed.')
}

export async function startDevServer(): Promise<string> {
  const wc = await bootWebContainer()
  setStatus('starting')
  log('Starting Vite dev server...')

  const serverProcess = await wc.spawn('npm', ['run', 'dev'])

  serverProcess.output.pipeTo(
    new WritableStream({
      write(chunk) {
        log(chunk)
      },
    })
  )

  return new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Dev server failed to start within 30 seconds'))
      setStatus('error', 'Dev server timed out')
    }, 30_000)

    wc.on('server-ready', (_port, url) => {
      clearTimeout(timeout)
      state.serverUrl = url
      setStatus('ready')
      log(`Dev server ready at ${url}`)
      resolve(url)
    })
  })
}

export async function teardown(): Promise<void> {
  if (instance) {
    instance.teardown()
    instance = null
    bootPromise = null
    state.status = 'idle'
    state.error = null
    state.serverUrl = null
    state.logs = []
    emit()
    log('WebContainer torn down.')
  }
}
