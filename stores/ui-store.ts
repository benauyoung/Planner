import { create } from 'zustand'
import type { EdgeType, NodeType, NodeStatus } from '@/types/project'

export type ViewType = 'plan' | 'architecture' | 'manage' | 'design' | 'agents'
export type ManageSubView = 'list' | 'table' | 'board' | 'timeline' | 'sprints' | 'backend'
export type PlanSubView = 'canvas' | 'steps'
export type LayoutMode = 'dagre' | 'spring'

interface PendingEdge {
  sourceId: string
  edgeType: EdgeType
}

interface UIState {
  theme: 'light' | 'dark'
  selectedNodeId: string | null
  selectedNodeIds: Set<string>
  detailPanelOpen: boolean
  blastRadiusMode: boolean
  blastRadiusNodeIds: Set<string>
  pendingEdge: PendingEdge | null
  commandPaletteOpen: boolean
  shortcutsHelpOpen: boolean
  currentView: ViewType
  manageSubView: ManageSubView
  planSubView: PlanSubView
  searchQuery: string
  filterType: NodeType | null
  filterStatus: NodeStatus | null
  prdPipelineOpen: boolean
  territorySyncOpen: boolean
  layoutMode: LayoutMode
  minimapOpen: boolean
  snapToGrid: boolean
  gridSize: number
  showSmartGuides: boolean
  springSimulationRunning: boolean
  quickQuestionsPanelOpen: boolean
  setTheme: (theme: 'light' | 'dark') => void
  selectNode: (nodeId: string | null) => void
  toggleNodeSelection: (nodeId: string) => void
  setSelectedNodes: (nodeIds: string[]) => void
  clearSelection: () => void
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
  setManageSubView: (sub: ManageSubView) => void
  setPlanSubView: (sub: PlanSubView) => void
  setSearchQuery: (query: string) => void
  setFilterType: (type: NodeType | null) => void
  setFilterStatus: (status: NodeStatus | null) => void
  clearFilters: () => void
  setPrdPipelineOpen: (open: boolean) => void
  setTerritorySyncOpen: (open: boolean) => void
  setLayoutMode: (mode: LayoutMode) => void
  setMinimapOpen: (open: boolean) => void
  setSnapToGrid: (on: boolean) => void
  setGridSize: (size: number) => void
  setShowSmartGuides: (on: boolean) => void
  setSpringSimulationRunning: (running: boolean) => void
  setQuickQuestionsPanelOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  selectedNodeId: null,
  selectedNodeIds: new Set<string>(),
  detailPanelOpen: false,
  blastRadiusMode: false,
  blastRadiusNodeIds: new Set(),
  pendingEdge: null,
  commandPaletteOpen: false,
  shortcutsHelpOpen: false,
  currentView: 'plan' as ViewType,
  manageSubView: 'list' as ManageSubView,
  planSubView: 'canvas' as PlanSubView,
  searchQuery: '',
  filterType: null,
  filterStatus: null,
  prdPipelineOpen: false,
  territorySyncOpen: false,
  layoutMode: 'dagre' as LayoutMode,
  minimapOpen: true,
  snapToGrid: false,
  gridSize: 20,
  showSmartGuides: true,
  springSimulationRunning: false,
  quickQuestionsPanelOpen: false,
  setTheme: (theme) => set({ theme }),
  selectNode: (nodeId) =>
    set({ selectedNodeId: nodeId, selectedNodeIds: nodeId ? new Set([nodeId]) : new Set(), detailPanelOpen: nodeId !== null }),
  toggleNodeSelection: (nodeId) =>
    set((state) => {
      const next = new Set(state.selectedNodeIds)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return { selectedNodeIds: next, selectedNodeId: nodeId, detailPanelOpen: true }
    }),
  setSelectedNodes: (nodeIds) =>
    set({
      selectedNodeIds: new Set(nodeIds),
      selectedNodeId: nodeIds.length > 0 ? nodeIds[nodeIds.length - 1] : null,
      detailPanelOpen: nodeIds.length > 0,
    }),
  clearSelection: () =>
    set({ selectedNodeIds: new Set(), selectedNodeId: null, detailPanelOpen: false }),
  openDetailPanel: () => set({ detailPanelOpen: true }),
  closeDetailPanel: () => set({ detailPanelOpen: false, selectedNodeId: null, selectedNodeIds: new Set() }),
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
  setManageSubView: (sub) => set({ manageSubView: sub }),
  setPlanSubView: (sub) => set({ planSubView: sub }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterType: (type) => set({ filterType: type }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  clearFilters: () => set({ searchQuery: '', filterType: null, filterStatus: null }),
  setPrdPipelineOpen: (open) => set({ prdPipelineOpen: open }),
  setTerritorySyncOpen: (open) => set({ territorySyncOpen: open }),
  setLayoutMode: (mode) => set({ layoutMode: mode }),
  setMinimapOpen: (open) => set({ minimapOpen: open }),
  setSnapToGrid: (on) => set({ snapToGrid: on }),
  setGridSize: (size) => set({ gridSize: size }),
  setShowSmartGuides: (on) => set({ showSmartGuides: on }),
  setSpringSimulationRunning: (running) => set({ springSimulationRunning: running }),
  setQuickQuestionsPanelOpen: (open) => set({ quickQuestionsPanelOpen: open }),
}))
