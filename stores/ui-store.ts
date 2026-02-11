import { create } from 'zustand'
import type { EdgeType } from '@/types/project'

interface PendingEdge {
  sourceId: string
  edgeType: EdgeType
}

interface UIState {
  theme: 'light' | 'dark'
  selectedNodeId: string | null
  detailPanelOpen: boolean
  blastRadiusMode: boolean
  blastRadiusNodeIds: Set<string>
  pendingEdge: PendingEdge | null
  setTheme: (theme: 'light' | 'dark') => void
  selectNode: (nodeId: string | null) => void
  openDetailPanel: () => void
  closeDetailPanel: () => void
  toggleDetailPanel: () => void
  setBlastRadiusMode: (on: boolean) => void
  setBlastRadiusNodeIds: (ids: Set<string>) => void
  startEdgeCreation: (sourceId: string, edgeType: EdgeType) => void
  cancelEdgeCreation: () => void
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  selectedNodeId: null,
  detailPanelOpen: false,
  blastRadiusMode: false,
  blastRadiusNodeIds: new Set(),
  pendingEdge: null,
  setTheme: (theme) => set({ theme }),
  selectNode: (nodeId) =>
    set({ selectedNodeId: nodeId, detailPanelOpen: nodeId !== null }),
  openDetailPanel: () => set({ detailPanelOpen: true }),
  closeDetailPanel: () => set({ detailPanelOpen: false, selectedNodeId: null }),
  toggleDetailPanel: () =>
    set((state) => ({ detailPanelOpen: !state.detailPanelOpen })),
  setBlastRadiusMode: (on) =>
    set({ blastRadiusMode: on, blastRadiusNodeIds: on ? new Set() : new Set() }),
  setBlastRadiusNodeIds: (ids) => set({ blastRadiusNodeIds: ids }),
  startEdgeCreation: (sourceId, edgeType) =>
    set({ pendingEdge: { sourceId, edgeType } }),
  cancelEdgeCreation: () => set({ pendingEdge: null }),
}))
