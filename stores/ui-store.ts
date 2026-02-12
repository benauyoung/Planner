import { create } from 'zustand'
import type { EdgeType, NodeType, NodeStatus } from '@/types/project'

export type ViewType = 'canvas' | 'list' | 'table' | 'board' | 'timeline' | 'sprints' | 'pages'

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
  commandPaletteOpen: boolean
  shortcutsHelpOpen: boolean
  currentView: ViewType
  searchQuery: string
  filterType: NodeType | null
  filterStatus: NodeStatus | null
  setTheme: (theme: 'light' | 'dark') => void
  selectNode: (nodeId: string | null) => void
  openDetailPanel: () => void
  closeDetailPanel: () => void
  toggleDetailPanel: () => void
  setBlastRadiusMode: (on: boolean) => void
  setBlastRadiusNodeIds: (ids: Set<string>) => void
  startEdgeCreation: (sourceId: string, edgeType: EdgeType) => void
  cancelEdgeCreation: () => void
  openCommandPalette: () => void
  closeCommandPalette: () => void
  openShortcutsHelp: () => void
  closeShortcutsHelp: () => void
  setCurrentView: (view: ViewType) => void
  setSearchQuery: (query: string) => void
  setFilterType: (type: NodeType | null) => void
  setFilterStatus: (status: NodeStatus | null) => void
  clearFilters: () => void
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  selectedNodeId: null,
  detailPanelOpen: false,
  blastRadiusMode: false,
  blastRadiusNodeIds: new Set(),
  pendingEdge: null,
  commandPaletteOpen: false,
  shortcutsHelpOpen: false,
  currentView: 'canvas' as ViewType,
  searchQuery: '',
  filterType: null,
  filterStatus: null,
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
  openCommandPalette: () => set({ commandPaletteOpen: true, shortcutsHelpOpen: false }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  openShortcutsHelp: () => set({ shortcutsHelpOpen: true, commandPaletteOpen: false }),
  closeShortcutsHelp: () => set({ shortcutsHelpOpen: false }),
  setCurrentView: (view) => set({ currentView: view }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterType: (type) => set({ filterType: type }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  clearFilters: () => set({ searchQuery: '', filterType: null, filterStatus: null }),
}))
