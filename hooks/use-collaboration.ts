'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  getCollaborationProvider,
  getCollaboratorColor,
  type CollaboratorPresence,
  type CollaborationProvider,
} from '@/services/collaboration'

interface UseCollaborationOptions {
  roomId: string
  userName: string
  userAvatar?: string
}

export function useCollaboration({ roomId, userName, userAvatar }: UseCollaborationOptions) {
  const [peers, setPeers] = useState<CollaboratorPresence[]>([])
  const [connected, setConnected] = useState(false)
  const providerRef = useRef<CollaborationProvider | null>(null)

  useEffect(() => {
    const provider = getCollaborationProvider()
    providerRef.current = provider

    const user: CollaboratorPresence = {
      id: `local-${Date.now()}`,
      name: userName,
      color: getCollaboratorColor(0),
      avatar: userAvatar,
      lastSeen: Date.now(),
    }

    provider.connect(roomId, user)
    setConnected(true)

    const unsubscribe = provider.onPresenceChange((updatedPeers) => {
      setPeers(updatedPeers)
    })

    return () => {
      unsubscribe()
      provider.disconnect()
      setConnected(false)
    }
  }, [roomId, userName, userAvatar])

  const updateCursor = useCallback((x: number, y: number) => {
    providerRef.current?.updatePresence({ cursor: { x, y } })
  }, [])

  const updateSelectedNode = useCallback((nodeId: string | null) => {
    providerRef.current?.updatePresence({ selectedNodeId: nodeId })
  }, [])

  return { peers, connected, updateCursor, updateSelectedNode }
}
