import { create } from 'zustand'
import type { Project, PlanNode, NodeStatus, NodeType, NodeQuestion, NodePRD, NodePrompt } from '@/types/project'
import type { FlowNode, FlowEdge } from '@/types/canvas'
import type { AIPlanNode } from '@/types/chat'
import { generateId } from '@/lib/id'
import { NODE_CONFIG, NODE_CHILD_TYPE } from '@/lib/constants'

const MAX_UNDO_STACK = 50

interface ProjectState {
  currentProject: Project | null
  projects: Project[]
  flowNodes: FlowNode[]
  flowEdges: FlowEdge[]
  _undoStack: Project[]
  _redoStack: Project[]
  canUndo: boolean
  canRedo: boolean
  setCurrentProject: (project: Project | null) => void
  setProjects: (projects: Project[]) => void
  setFlowNodes: (nodes: FlowNode[]) => void
  setFlowEdges: (edges: FlowEdge[]) => void
  initDraftProject: (userId: string) => void
  mergeNodes: (newNodes: AIPlanNode[], suggestedTitle?: string | null) => void
  ingestPlan: (plan: { title: string; description: string; nodes: AIPlanNode[] }, userId: string) => Project
  updateNodeStatus: (nodeId: string, status: NodeStatus) => void
  updateNodeContent: (nodeId: string, title: string, description: string) => void
  toggleNodeCollapse: (nodeId: string) => void
  deleteNode: (nodeId: string) => void
  addChildNode: (parentId: string, title: string) => string | null
  duplicateNode: (nodeId: string, includeChildren: boolean) => string | null
  changeNodeType: (nodeId: string, newType: NodeType) => void
  answerNodeQuestion: (nodeId: string, questionId: string, answer: string) => void
  addNodeQuestions: (nodeId: string, questions: { question: string; options: string[] }[]) => void
  addCustomNodeQuestion: (nodeId: string, question: string) => void
  updateNodeRichContent: (nodeId: string, content: string) => void
  addNodeImage: (nodeId: string, imageUrl: string) => void
  removeNodeImage: (nodeId: string, imageUrl: string) => void
  addFreeNode: (type: NodeType, title: string, parentId?: string | null) => string
  connectNodes: (sourceId: string, targetId: string) => void
  setNodeParent: (nodeId: string, parentId: string | null) => void
  addNodePRD: (nodeId: string, title: string, content: string) => string | null
  updateNodePRD: (nodeId: string, prdId: string, title: string, content: string) => void
  removeNodePRD: (nodeId: string, prdId: string) => void
  addNodePrompt: (nodeId: string, title: string, content: string) => string | null
  updateNodePrompt: (nodeId: string, promptId: string, title: string, content: string) => void
  removeNodePrompt: (nodeId: string, promptId: string) => void
  addProject: (project: Project) => void
  removeProject: (projectId: string) => void
  undo: () => void
  redo: () => void
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
        questionsTotal: node.questions?.length ?? 0,
        questionsAnswered: node.questions?.filter((q) => (q.answer ?? '').trim() !== '').length ?? 0,
        content: node.content,
        images: node.images,
        prds: node.prds,
        prompts: node.prompts,
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
      type: 'bezier',
      animated: false,
    }))

  return { flowNodes, flowEdges }
}

export const useProjectStore = create<ProjectState>((set, get) => {
  /** Push current project onto undo stack and apply updatedProject */
  function commitProjectUpdate(updatedProject: Project) {
    const prev = get().currentProject
    const undoStack = prev
      ? [...get()._undoStack, prev].slice(-MAX_UNDO_STACK)
      : get()._undoStack
    const { flowNodes, flowEdges } = planNodesToFlow(updatedProject.nodes)
    set({
      currentProject: updatedProject,
      flowNodes,
      flowEdges,
      _undoStack: undoStack,
      _redoStack: [],
      canUndo: undoStack.length > 0,
      canRedo: false,
    })
  }

  /** Apply project without pushing to undo (for view-only changes like collapse) */
  function applyWithoutUndo(updatedProject: Project) {
    const { flowNodes, flowEdges } = planNodesToFlow(updatedProject.nodes)
    set({ currentProject: updatedProject, flowNodes, flowEdges })
  }

  return {
    currentProject: null,
    projects: [],
    flowNodes: [],
    flowEdges: [],
    _undoStack: [],
    _redoStack: [],
    canUndo: false,
    canRedo: false,

    setCurrentProject: (project) => {
      if (project) {
        const { flowNodes, flowEdges } = planNodesToFlow(project.nodes)
        set({
          currentProject: project,
          flowNodes,
          flowEdges,
          _undoStack: [],
          _redoStack: [],
          canUndo: false,
          canRedo: false,
        })
      } else {
        set({
          currentProject: null,
          flowNodes: [],
          flowEdges: [],
          _undoStack: [],
          _redoStack: [],
          canUndo: false,
          canRedo: false,
        })
      }
    },

    setProjects: (projects) => set({ projects }),
    setFlowNodes: (flowNodes) => set({ flowNodes }),
    setFlowEdges: (flowEdges) => set({ flowEdges }),

    initDraftProject: (userId: string) => {
      const existing = get().currentProject
      if (existing && existing.phase === 'planning') return

      const project: Project = {
        id: generateId(),
        userId,
        title: 'Untitled Project',
        description: '',
        phase: 'planning',
        nodes: [],
        edges: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      set({
        currentProject: project,
        flowNodes: [],
        flowEdges: [],
        _undoStack: [],
        _redoStack: [],
        canUndo: false,
        canRedo: false,
      })
    },

    mergeNodes: (newNodes, suggestedTitle) => {
      const project = get().currentProject
      if (!project) return

      const nodeMap = new Map<string, PlanNode>()
      for (const n of project.nodes) {
        nodeMap.set(n.id, n)
      }

      for (const incoming of newNodes) {
        const incomingQuestions: NodeQuestion[] = (incoming.questions || []).map((q, i) => {
          if (typeof q === 'string') {
            return { id: `${incoming.id}-q${i}`, question: q, answer: '' }
          }
          return { id: `${incoming.id}-q${i}`, question: q.question, answer: '', options: q.options }
        })
        const existing = nodeMap.get(incoming.id)
        if (existing) {
          const mergedQuestions = incomingQuestions.map((iq) => {
            const existingQ = existing.questions?.find((eq) => eq.question === iq.question)
            return existingQ ? { ...iq, answer: existingQ.answer } : iq
          })
          nodeMap.set(incoming.id, {
            ...existing,
            type: incoming.type,
            title: incoming.title,
            description: incoming.description,
            parentId: incoming.parentId,
            questions: mergedQuestions.length > 0 ? mergedQuestions : existing.questions,
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
            questions: incomingQuestions,
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

      commitProjectUpdate(updatedProject)
    },

    ingestPlan: (plan, userId) => {
      const nodes: PlanNode[] = plan.nodes.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        description: n.description,
        status: 'not_started' as const,
        parentId: n.parentId,
        collapsed: false,
        questions: (n.questions || []).map((q, i) => {
          if (typeof q === 'string') {
            return { id: `${n.id}-q${i}`, question: q, answer: '' }
          }
          return { id: `${n.id}-q${i}`, question: q.question, answer: '', options: q.options }
        }),
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
        userId,
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
        _undoStack: [],
        _redoStack: [],
        canUndo: false,
        canRedo: false,
      })

      return project
    },

    updateNodeStatus: (nodeId, status) => {
      const project = get().currentProject
      if (!project) return

      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId ? { ...n, status } : n
      )
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    updateNodeContent: (nodeId, title, description) => {
      const project = get().currentProject
      if (!project) return

      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId ? { ...n, title, description } : n
      )
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    toggleNodeCollapse: (nodeId) => {
      const project = get().currentProject
      if (!project) return

      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId ? { ...n, collapsed: !n.collapsed } : n
      )
      applyWithoutUndo({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
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
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    addChildNode: (parentId, title) => {
      const project = get().currentProject
      if (!project) return null

      const parent = project.nodes.find((n) => n.id === parentId)
      if (!parent) return null

      const childType = NODE_CHILD_TYPE[parent.type]
      if (!childType) return null

      const newNode: PlanNode = {
        id: generateId(),
        type: childType,
        title,
        description: '',
        status: 'not_started',
        parentId,
        collapsed: false,
        questions: [],
      }

      const updatedNodes = [...project.nodes, newNode]
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
      return newNode.id
    },

    duplicateNode: (nodeId, includeChildren) => {
      const project = get().currentProject
      if (!project) return null

      const node = project.nodes.find((n) => n.id === nodeId)
      if (!node) return null

      const idMap = new Map<string, string>()
      const clonedNodes: PlanNode[] = []

      const rootCloneId = generateId()
      idMap.set(node.id, rootCloneId)
      clonedNodes.push({
        ...node,
        id: rootCloneId,
        title: `${node.title} (Copy)`,
      })

      if (includeChildren) {
        function cloneDescendants(originalParentId: string) {
          const kids = project!.nodes.filter((n) => n.parentId === originalParentId)
          for (const kid of kids) {
            const newId = generateId()
            idMap.set(kid.id, newId)
            clonedNodes.push({
              ...kid,
              id: newId,
              parentId: idMap.get(kid.parentId!)!,
            })
            cloneDescendants(kid.id)
          }
        }
        cloneDescendants(node.id)
      }

      const updatedNodes = [...project.nodes, ...clonedNodes]
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
      return rootCloneId
    },

    changeNodeType: (nodeId, newType) => {
      const project = get().currentProject
      if (!project) return

      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId ? { ...n, type: newType } : n
      )
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    answerNodeQuestion: (nodeId, questionId, answer) => {
      const project = get().currentProject
      if (!project) return

      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              questions: n.questions.map((q) =>
                q.id === questionId ? { ...q, answer } : q
              ),
            }
          : n
      )
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    addNodeQuestions: (nodeId, questions) => {
      const project = get().currentProject
      if (!project) return

      const updatedNodes = project.nodes.map((n) => {
        if (n.id !== nodeId) return n
        const existingIds = new Set(n.questions.map((q) => q.question))
        const newQuestions: NodeQuestion[] = questions
          .filter((q) => !existingIds.has(q.question))
          .map((q, i) => ({
            id: `${nodeId}-q${Date.now()}-${i}`,
            question: q.question,
            answer: '',
            options: q.options,
          }))
        return { ...n, questions: [...n.questions, ...newQuestions] }
      })
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    addCustomNodeQuestion: (nodeId, question) => {
      const project = get().currentProject
      if (!project) return

      const updatedNodes = project.nodes.map((n) => {
        if (n.id !== nodeId) return n
        const newQ: NodeQuestion = {
          id: `${nodeId}-custom-${Date.now()}`,
          question,
          answer: '',
          isCustom: true,
        }
        return { ...n, questions: [...n.questions, newQ] }
      })
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    updateNodeRichContent: (nodeId, content) => {
      const project = get().currentProject
      if (!project) return

      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId ? { ...n, content } : n
      )
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    addNodeImage: (nodeId, imageUrl) => {
      const project = get().currentProject
      if (!project) return

      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId ? { ...n, images: [...(n.images || []), imageUrl] } : n
      )
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    removeNodeImage: (nodeId, imageUrl) => {
      const project = get().currentProject
      if (!project) return

      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId
          ? { ...n, images: (n.images || []).filter((img) => img !== imageUrl) }
          : n
      )
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    addFreeNode: (type, title, parentId = null) => {
      const project = get().currentProject
      if (!project) return ''

      const newNode: PlanNode = {
        id: generateId(),
        type,
        title,
        description: '',
        status: 'not_started',
        parentId: parentId ?? null,
        collapsed: false,
        questions: [],
        content: type === 'notes' ? '' : undefined,
        images: type === 'moodboard' ? [] : undefined,
      }

      const updatedNodes = [...project.nodes, newNode]
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
      return newNode.id
    },

    connectNodes: (sourceId, targetId) => {
      const project = get().currentProject
      if (!project) return
      const targetNode = project.nodes.find((n) => n.id === targetId)
      if (!targetNode || targetNode.parentId === sourceId) return
      const updatedNodes = project.nodes.map((n) =>
        n.id === targetId ? { ...n, parentId: sourceId } : n
      )
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    setNodeParent: (nodeId, parentId) => {
      const project = get().currentProject
      if (!project) return
      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId ? { ...n, parentId } : n
      )
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    addNodePRD: (nodeId, title, content) => {
      const project = get().currentProject
      if (!project) return null
      const id = generateId()
      const prd: NodePRD = { id, title, content, updatedAt: Date.now() }
      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId ? { ...n, prds: [...(n.prds || []), prd] } : n
      )
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
      return id
    },

    updateNodePRD: (nodeId, prdId, title, content) => {
      const project = get().currentProject
      if (!project) return
      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId
          ? { ...n, prds: (n.prds || []).map((p) => p.id === prdId ? { ...p, title, content, updatedAt: Date.now() } : p) }
          : n
      )
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    removeNodePRD: (nodeId, prdId) => {
      const project = get().currentProject
      if (!project) return
      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId ? { ...n, prds: (n.prds || []).filter((p) => p.id !== prdId) } : n
      )
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    addNodePrompt: (nodeId, title, content) => {
      const project = get().currentProject
      if (!project) return null
      const id = generateId()
      const prompt: NodePrompt = { id, title, content, updatedAt: Date.now() }
      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId ? { ...n, prompts: [...(n.prompts || []), prompt] } : n
      )
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
      return id
    },

    updateNodePrompt: (nodeId, promptId, title, content) => {
      const project = get().currentProject
      if (!project) return
      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId
          ? { ...n, prompts: (n.prompts || []).map((p) => p.id === promptId ? { ...p, title, content, updatedAt: Date.now() } : p) }
          : n
      )
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    removeNodePrompt: (nodeId, promptId) => {
      const project = get().currentProject
      if (!project) return
      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId ? { ...n, prompts: (n.prompts || []).filter((p) => p.id !== promptId) } : n
      )
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    addProject: (project) =>
      set((state) => ({ projects: [...state.projects, project] })),

    removeProject: (projectId) =>
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
        currentProject:
          state.currentProject?.id === projectId ? null : state.currentProject,
      })),

    undo: () => {
      const { _undoStack, _redoStack, currentProject } = get()
      if (_undoStack.length === 0) return

      const previous = _undoStack[_undoStack.length - 1]
      const newUndoStack = _undoStack.slice(0, -1)
      const newRedoStack = currentProject
        ? [..._redoStack, currentProject]
        : _redoStack

      const { flowNodes, flowEdges } = planNodesToFlow(previous.nodes)
      set({
        currentProject: previous,
        flowNodes,
        flowEdges,
        _undoStack: newUndoStack,
        _redoStack: newRedoStack,
        canUndo: newUndoStack.length > 0,
        canRedo: newRedoStack.length > 0,
      })
    },

    redo: () => {
      const { _undoStack, _redoStack, currentProject } = get()
      if (_redoStack.length === 0) return

      const next = _redoStack[_redoStack.length - 1]
      const newRedoStack = _redoStack.slice(0, -1)
      const newUndoStack = currentProject
        ? [..._undoStack, currentProject]
        : _undoStack

      const { flowNodes, flowEdges } = planNodesToFlow(next.nodes)
      set({
        currentProject: next,
        flowNodes,
        flowEdges,
        _undoStack: newUndoStack,
        _redoStack: newRedoStack,
        canUndo: newUndoStack.length > 0,
        canRedo: newRedoStack.length > 0,
      })
    },
  }
})
