import { create } from 'zustand'
import type { Project, PlanNode, NodeStatus } from '@/types/project'
import type { FlowNode, FlowEdge } from '@/types/canvas'
import type { AIPlanNode } from '@/types/chat'
import { generateId } from '@/lib/id'
import { NODE_CONFIG } from '@/lib/constants'

interface ProjectState {
  currentProject: Project | null
  projects: Project[]
  flowNodes: FlowNode[]
  flowEdges: FlowEdge[]
  setCurrentProject: (project: Project | null) => void
  setProjects: (projects: Project[]) => void
  setFlowNodes: (nodes: FlowNode[]) => void
  setFlowEdges: (edges: FlowEdge[]) => void
  initDraftProject: () => void
  mergeNodes: (newNodes: AIPlanNode[], suggestedTitle?: string | null) => void
  ingestPlan: (plan: { title: string; description: string; nodes: AIPlanNode[] }) => Project
  updateNodeStatus: (nodeId: string, status: NodeStatus) => void
  updateNodeContent: (nodeId: string, title: string, description: string) => void
  toggleNodeCollapse: (nodeId: string) => void
  deleteNode: (nodeId: string) => void
  addProject: (project: Project) => void
  removeProject: (projectId: string) => void
}

function planNodesToFlow(nodes: PlanNode[]): { flowNodes: FlowNode[]; flowEdges: FlowEdge[] } {
  const flowNodes: FlowNode[] = nodes
    .filter((node) => {
      if (!node.parentId) return true
      const parent = nodes.find((n) => n.id === node.parentId)
      return !parent?.collapsed
    })
    .map((node) => ({
      id: node.id,
      type: node.type,
      position: { x: 0, y: 0 },
      data: {
        label: node.title,
        description: node.description,
        nodeType: node.type,
        status: node.status,
        collapsed: node.collapsed,
        parentId: node.parentId,
      },
      width: NODE_CONFIG[node.type].width,
      height: NODE_CONFIG[node.type].height,
    }))

  const visibleIds = new Set(flowNodes.map((n) => n.id))
  const flowEdges: FlowEdge[] = nodes
    .filter((node) => node.parentId && visibleIds.has(node.id) && visibleIds.has(node.parentId!))
    .map((node) => ({
      id: `${node.parentId}-${node.id}`,
      source: node.parentId!,
      target: node.id,
      type: 'smoothstep',
      animated: false,
    }))

  return { flowNodes, flowEdges }
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProject: null,
  projects: [],
  flowNodes: [],
  flowEdges: [],
  setCurrentProject: (project) => {
    if (project) {
      const { flowNodes, flowEdges } = planNodesToFlow(project.nodes)
      set({ currentProject: project, flowNodes, flowEdges })
    } else {
      set({ currentProject: null, flowNodes: [], flowEdges: [] })
    }
  },
  setProjects: (projects) => set({ projects }),
  setFlowNodes: (flowNodes) => set({ flowNodes }),
  setFlowEdges: (flowEdges) => set({ flowEdges }),

  initDraftProject: () => {
    const existing = get().currentProject
    if (existing && existing.phase === 'planning') return

    const project: Project = {
      id: generateId(),
      title: 'Untitled Project',
      description: '',
      phase: 'planning',
      nodes: [],
      edges: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    set({ currentProject: project, flowNodes: [], flowEdges: [] })
  },

  mergeNodes: (newNodes, suggestedTitle) => {
    const project = get().currentProject
    if (!project) return

    const nodeMap = new Map<string, PlanNode>()
    for (const n of project.nodes) {
      nodeMap.set(n.id, n)
    }

    for (const incoming of newNodes) {
      const existing = nodeMap.get(incoming.id)
      if (existing) {
        nodeMap.set(incoming.id, {
          ...existing,
          type: incoming.type,
          title: incoming.title,
          description: incoming.description,
          parentId: incoming.parentId,
        })
      } else {
        nodeMap.set(incoming.id, {
          id: incoming.id,
          type: incoming.type,
          title: incoming.title,
          description: incoming.description,
          status: 'not_started',
          parentId: incoming.parentId,
          collapsed: false,
        })
      }
    }

    const mergedNodes = Array.from(nodeMap.values())
    const edges = mergedNodes
      .filter((n) => n.parentId)
      .map((n) => ({
        id: `${n.parentId}-${n.id}`,
        source: n.parentId!,
        target: n.id,
      }))

    const updatedTitle = suggestedTitle || project.title
    const updatedProject: Project = {
      ...project,
      title: updatedTitle,
      nodes: mergedNodes,
      edges,
      updatedAt: Date.now(),
    }

    const { flowNodes, flowEdges } = planNodesToFlow(mergedNodes)
    set({ currentProject: updatedProject, flowNodes, flowEdges })
  },

  ingestPlan: (plan) => {
    const nodes: PlanNode[] = plan.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      description: n.description,
      status: 'not_started' as const,
      parentId: n.parentId,
      collapsed: false,
    }))

    const edges = nodes
      .filter((n) => n.parentId)
      .map((n) => ({
        id: `${n.parentId}-${n.id}`,
        source: n.parentId!,
        target: n.id,
      }))

    const project: Project = {
      id: generateId(),
      title: plan.title,
      description: plan.description,
      phase: 'active',
      nodes,
      edges,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    const { flowNodes, flowEdges } = planNodesToFlow(nodes)
    set({
      currentProject: project,
      flowNodes,
      flowEdges,
      projects: [...get().projects, project],
    })

    return project
  },

  updateNodeStatus: (nodeId, status) => {
    const project = get().currentProject
    if (!project) return

    const updatedNodes = project.nodes.map((n) =>
      n.id === nodeId ? { ...n, status } : n
    )
    const updatedProject = { ...project, nodes: updatedNodes, updatedAt: Date.now() }
    const { flowNodes, flowEdges } = planNodesToFlow(updatedNodes)
    set({ currentProject: updatedProject, flowNodes, flowEdges })
  },

  updateNodeContent: (nodeId, title, description) => {
    const project = get().currentProject
    if (!project) return

    const updatedNodes = project.nodes.map((n) =>
      n.id === nodeId ? { ...n, title, description } : n
    )
    const updatedProject = { ...project, nodes: updatedNodes, updatedAt: Date.now() }
    const { flowNodes, flowEdges } = planNodesToFlow(updatedNodes)
    set({ currentProject: updatedProject, flowNodes, flowEdges })
  },

  toggleNodeCollapse: (nodeId) => {
    const project = get().currentProject
    if (!project) return

    const updatedNodes = project.nodes.map((n) =>
      n.id === nodeId ? { ...n, collapsed: !n.collapsed } : n
    )
    const updatedProject = { ...project, nodes: updatedNodes, updatedAt: Date.now() }
    const { flowNodes, flowEdges } = planNodesToFlow(updatedNodes)
    set({ currentProject: updatedProject, flowNodes, flowEdges })
  },

  deleteNode: (nodeId) => {
    const project = get().currentProject
    if (!project) return

    const descendantIds = new Set<string>()
    function collectDescendants(id: string) {
      descendantIds.add(id)
      project!.nodes.filter((n) => n.parentId === id).forEach((n) => collectDescendants(n.id))
    }
    collectDescendants(nodeId)

    const updatedNodes = project.nodes.filter((n) => !descendantIds.has(n.id))
    const updatedProject = { ...project, nodes: updatedNodes, updatedAt: Date.now() }
    const { flowNodes, flowEdges } = planNodesToFlow(updatedNodes)
    set({ currentProject: updatedProject, flowNodes, flowEdges })
  },

  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),

  removeProject: (projectId) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== projectId),
      currentProject:
        state.currentProject?.id === projectId ? null : state.currentProject,
    })),
}))
