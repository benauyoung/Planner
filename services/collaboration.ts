/**
 * Collaboration service — client-side presence and awareness layer.
 *
 * This module provides a pluggable collaboration provider interface.
 * Currently uses a local-only mock provider. Replace with Yjs + PartyKit
 * or Liveblocks for real multi-user sync.
 */

export interface CollaboratorPresence {
  id: string
  name: string
  color: string
  avatar?: string
  cursor?: { x: number; y: number }
  selectedNodeId?: string | null
  lastSeen: number
}

export interface CollaborationProvider {
  connect: (roomId: string, user: CollaboratorPresence) => void
  disconnect: () => void
  updatePresence: (update: Partial<CollaboratorPresence>) => void
  onPresenceChange: (callback: (peers: CollaboratorPresence[]) => void) => () => void
  getPeers: () => CollaboratorPresence[]
  isConnected: () => boolean
}

/**
 * Local-only mock provider for development.
 * Simulates presence for the current user only.
 * Replace with YjsCollaborationProvider for production.
 */
export class LocalCollaborationProvider implements CollaborationProvider {
  private user: CollaboratorPresence | null = null
  private connected = false
  private listeners: Set<(peers: CollaboratorPresence[]) => void> = new Set()

  connect(roomId: string, user: CollaboratorPresence) {
    this.user = { ...user, lastSeen: Date.now() }
    this.connected = true
    this.notifyListeners()
  }

  disconnect() {
    this.connected = false
    this.user = null
    this.notifyListeners()
  }

  updatePresence(update: Partial<CollaboratorPresence>) {
    if (!this.user) return
    this.user = { ...this.user, ...update, lastSeen: Date.now() }
    this.notifyListeners()
  }

  onPresenceChange(callback: (peers: CollaboratorPresence[]) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  getPeers(): CollaboratorPresence[] {
    // In local mode, no remote peers
    return []
  }

  isConnected(): boolean {
    return this.connected
  }

  private notifyListeners() {
    const peers = this.getPeers()
    this.listeners.forEach((cb) => cb(peers))
  }
}

// Singleton provider instance
let provider: CollaborationProvider | null = null

export function getCollaborationProvider(): CollaborationProvider {
  if (!provider) {
    provider = new LocalCollaborationProvider()
  }
  return provider
}

export function setCollaborationProvider(p: CollaborationProvider) {
  provider = p
}

// Color palette for collaborator cursors
export const COLLABORATOR_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1',
]

export function getCollaboratorColor(index: number): string {
  return COLLABORATOR_COLORS[index % COLLABORATOR_COLORS.length]
}
