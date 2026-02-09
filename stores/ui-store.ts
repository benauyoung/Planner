import { create } from 'zustand'

interface UIState {
  theme: 'light' | 'dark'
  selectedNodeId: string | null
  detailPanelOpen: boolean
  setTheme: (theme: 'light' | 'dark') => void
  selectNode: (nodeId: string | null) => void
  openDetailPanel: () => void
  closeDetailPanel: () => void
  toggleDetailPanel: () => void
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  selectedNodeId: null,
  detailPanelOpen: false,
  setTheme: (theme) => set({ theme }),
  selectNode: (nodeId) =>
    set({ selectedNodeId: nodeId, detailPanelOpen: nodeId !== null }),
  openDetailPanel: () => set({ detailPanelOpen: true }),
  closeDetailPanel: () => set({ detailPanelOpen: false, selectedNodeId: null }),
  toggleDetailPanel: () =>
    set((state) => ({ detailPanelOpen: !state.detailPanelOpen })),
}))
