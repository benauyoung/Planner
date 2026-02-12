import { create } from 'zustand'
import type { Project, PlanNode, NodeStatus, NodeType, NodeQuestion, NodePRD, NodePrompt, ProjectEdge, EdgeType, Priority, TeamMember, NodeComment, ActivityEvent, Sprint, SprintStatus, ProjectVersion, DocumentBlock, NodeDocument, ProjectPage, PageEdge } from '@/types/project'
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
  addDependencyEdge: (sourceId: string, targetId: string, edgeType: EdgeType) => void
  removeDependencyEdge: (edgeId: string) => void
  setNodeParent: (nodeId: string, parentId: string | null) => void
  addNodePRD: (nodeId: string, title: string, content: string) => string | null
  updateNodePRD: (nodeId: string, prdId: string, title: string, content: string) => void
  removeNodePRD: (nodeId: string, prdId: string) => void
  addNodePrompt: (nodeId: string, title: string, content: string) => string | null
  updateNodePrompt: (nodeId: string, promptId: string, title: string, content: string) => void
  removeNodePrompt: (nodeId: string, promptId: string) => void
  updateProjectTitle: (title: string) => void
  addProject: (project: Project) => void
  removeProject: (projectId: string) => void
  toggleShareProject: () => string | null
  setNodeAssignee: (nodeId: string, assigneeId: string | undefined) => void
  setNodePriority: (nodeId: string, priority: Priority) => void
  setNodeDueDate: (nodeId: string, dueDate: number | undefined) => void
  setNodeEstimate: (nodeId: string, hours: number | undefined) => void
  setNodeTags: (nodeId: string, tags: string[]) => void
  addTeamMember: (member: TeamMember) => void
  removeTeamMember: (memberId: string) => void
  addNodeComment: (nodeId: string, authorName: string, authorColor: string, content: string) => void
  deleteNodeComment: (nodeId: string, commentId: string) => void
  addActivityEvent: (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => void
  createSprint: (name: string, startDate: number, endDate: number) => string
  updateSprint: (sprintId: string, updates: Partial<Pick<Sprint, 'name' | 'startDate' | 'endDate' | 'status'>>) => void
  deleteSprint: (sprintId: string) => void
  assignNodeToSprint: (nodeId: string, sprintId: string | undefined) => void
  saveVersion: (name: string) => string
  restoreVersion: (versionId: string) => void
  deleteVersion: (versionId: string) => void
  updateNodeDocument: (nodeId: string, blocks: DocumentBlock[]) => void
  updateNodeVersion: (nodeId: string, version: string) => void
  updateNodeSchemaType: (nodeId: string, schemaType: PlanNode['schemaType']) => void
  updateNodePromptType: (nodeId: string, promptType: PlanNode['promptType']) => void
  updateNodeTargetTool: (nodeId: string, targetTool: PlanNode['targetTool']) => void
  updateNodeReferenceType: (nodeId: string, referenceType: PlanNode['referenceType']) => void
  updateNodeUrl: (nodeId: string, url: string) => void
  updateNodeAcceptanceCriteria: (nodeId: string, criteria: string[]) => void
  setPages: (pages: ProjectPage[], pageEdges?: PageEdge[]) => void
  updatePageHtml: (pageId: string, html: string) => void
  updatePagePosition: (pageId: string, position: { x: number; y: number }) => void
  addPageEdge: (source: string, target: string, label?: string) => void
  removePageEdge: (edgeId: string) => void
  removePage: (pageId: string) => void
  undo: () => void
  redo: () => void
}

const EDGE_STYLES: Record<EdgeType, { strokeDasharray?: string; stroke: string; animated: boolean }> = {
  hierarchy: { stroke: 'hsl(var(--border))', animated: false },
  blocks: { strokeDasharray: '8 4', stroke: 'hsl(0 84% 60%)', animated: true },
  depends_on: { strokeDasharray: '8 4', stroke: 'hsl(217 91% 60%)', animated: false },
  informs: { stroke: 'hsl(200 80% 50%)', animated: false },
  defines: { stroke: 'hsl(270 60% 55%)', animated: false },
  implements: { stroke: 'hsl(152 60% 42%)', animated: false },
  references: { strokeDasharray: '6 4', stroke: 'hsl(220 10% 50%)', animated: false },
  supersedes: { strokeDasharray: '3 3', stroke: 'hsl(0 70% 55%)', animated: false },
}

function planNodesToFlow(nodes: PlanNode[], projectEdges: ProjectEdge[] = [], existingFlowNodes?: FlowNode[]): { flowNodes: FlowNode[]; flowEdges: FlowEdge[] } {
  const positionMap = new Map<string, { x: number; y: number }>()
  if (existingFlowNodes) {
    for (const fn of existingFlowNodes) {
      positionMap.set(fn.id, fn.position)
    }
  }

  const flowNodes: FlowNode[] = nodes
    .filter((node) => {
      if (!node.parentId) return true
      const parent = nodes.find((n) => n.id === node.parentId)
      return !parent?.collapsed
    })
    .map((node) => ({
      id: node.id,
      type: node.type,
      position: positionMap.get(node.id) || { x: 0, y: 0 },
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
        version: node.version,
        schemaType: node.schemaType,
        promptType: node.promptType,
        targetTool: node.targetTool,
        referenceType: node.referenceType,
        url: node.url,
        acceptanceCriteria: node.acceptanceCriteria,
      },
      width: NODE_CONFIG[node.type].width,
      height: NODE_CONFIG[node.type].height,
    }))

  const visibleIds = new Set(flowNodes.map((n) => n.id))

  // Hierarchy edges from parentId
  const hierarchyEdges: FlowEdge[] = nodes
    .filter((node) => node.parentId && visibleIds.has(node.id) && visibleIds.has(node.parentId!))
    .map((node) => ({
      id: `hierarchy-${node.parentId}-${node.id}`,
      source: node.parentId!,
      target: node.id,
      type: 'default',
      animated: false,
      style: { strokeDasharray: '6 4', strokeWidth: 1.5 },
    }))

  // Typed dependency edges from project.edges[]
  const depEdges: FlowEdge[] = (projectEdges || [])
    .filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target))
    .map((e) => {
      const edgeType = e.edgeType || 'hierarchy'
      const style = EDGE_STYLES[edgeType]
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'default',
        animated: style.animated,
        label: e.label || ({
          blocks: 'blocks',
          depends_on: 'depends on',
          informs: 'informs',
          defines: 'defines',
          implements: 'implements',
          references: 'references',
          supersedes: 'supersedes',
        } as Record<string, string>)[edgeType],
        style: {
          stroke: style.stroke,
          strokeWidth: 2,
          ...(style.strokeDasharray ? { strokeDasharray: style.strokeDasharray } : {}),
        },
      }
    })

  return { flowNodes, flowEdges: [...hierarchyEdges, ...depEdges] }
}

export const useProjectStore = create<ProjectState>((set, get) => {
  /** Push current project onto undo stack and apply updatedProject */
  function commitProjectUpdate(updatedProject: Project) {
    const prev = get().currentProject
    const undoStack = prev
      ? [...get()._undoStack, prev].slice(-MAX_UNDO_STACK)
      : get()._undoStack
    const { flowNodes, flowEdges } = planNodesToFlow(updatedProject.nodes, updatedProject.edges, get().flowNodes)
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
    const { flowNodes, flowEdges } = planNodesToFlow(updatedProject.nodes, updatedProject.edges, get().flowNodes)
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
        const { flowNodes, flowEdges } = planNodesToFlow(project.nodes, project.edges)
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

      const { flowNodes, flowEdges } = planNodesToFlow(nodes, edges)
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
        schemaType: type === 'schema' ? 'other' : undefined,
        promptType: type === 'prompt' ? 'implementation' : undefined,
        targetTool: type === 'prompt' ? 'generic' : undefined,
        referenceType: type === 'reference' ? 'link' : undefined,
        acceptanceCriteria: type === 'prd' ? [] : undefined,
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

    addDependencyEdge: (sourceId, targetId, edgeType) => {
      const project = get().currentProject
      if (!project) return
      // Prevent duplicate edges
      const exists = project.edges.some(
        (e) => e.source === sourceId && e.target === targetId && e.edgeType === edgeType
      )
      if (exists) return
      const edgeLabels: Record<string, string> = {
        blocks: 'blocks',
        depends_on: 'depends on',
        informs: 'informs',
        defines: 'defines',
        implements: 'implements',
        references: 'references',
        supersedes: 'supersedes',
      }
      const newEdge: ProjectEdge = {
        id: generateId(),
        source: sourceId,
        target: targetId,
        edgeType,
        label: edgeLabels[edgeType],
      }
      commitProjectUpdate({
        ...project,
        edges: [...project.edges, newEdge],
        updatedAt: Date.now(),
      })
    },

    removeDependencyEdge: (edgeId) => {
      const project = get().currentProject
      if (!project) return
      commitProjectUpdate({
        ...project,
        edges: project.edges.filter((e) => e.id !== edgeId),
        updatedAt: Date.now(),
      })
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

    toggleShareProject: () => {
      const project = get().currentProject
      if (!project) return null
      const isPublic = !project.isPublic
      const shareId = isPublic ? (project.shareId || project.id) : project.shareId
      const updated = { ...project, isPublic, shareId, updatedAt: Date.now() }
      commitProjectUpdate(updated)
      return isPublic ? shareId! : null
    },

    setNodeAssignee: (nodeId, assigneeId) => {
      const project = get().currentProject
      if (!project) return
      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId ? { ...n, assigneeId } : n
      )
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    setNodePriority: (nodeId, priority) => {
      const project = get().currentProject
      if (!project) return
      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId ? { ...n, priority } : n
      )
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    setNodeDueDate: (nodeId, dueDate) => {
      const project = get().currentProject
      if (!project) return
      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId ? { ...n, dueDate } : n
      )
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    setNodeEstimate: (nodeId, hours) => {
      const project = get().currentProject
      if (!project) return
      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId ? { ...n, estimatedHours: hours } : n
      )
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    setNodeTags: (nodeId, tags) => {
      const project = get().currentProject
      if (!project) return
      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId ? { ...n, tags } : n
      )
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    addTeamMember: (member) => {
      const project = get().currentProject
      if (!project) return
      const team = [...(project.team || []), member]
      commitProjectUpdate({ ...project, team, updatedAt: Date.now() })
    },

    removeTeamMember: (memberId) => {
      const project = get().currentProject
      if (!project) return
      const team = (project.team || []).filter((m) => m.id !== memberId)
      const updatedNodes = project.nodes.map((n) =>
        n.assigneeId === memberId ? { ...n, assigneeId: undefined } : n
      )
      commitProjectUpdate({ ...project, team, nodes: updatedNodes, updatedAt: Date.now() })
    },

    addNodeComment: (nodeId, authorName, authorColor, content) => {
      const project = get().currentProject
      if (!project) return
      const comment: NodeComment = {
        id: generateId(),
        authorId: 'local',
        authorName,
        authorColor,
        content,
        createdAt: Date.now(),
      }
      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId ? { ...n, comments: [...(n.comments || []), comment] } : n
      )
      const activity: ActivityEvent = {
        id: generateId(),
        type: 'comment',
        nodeId,
        nodeTitle: project.nodes.find((n) => n.id === nodeId)?.title || '',
        actorName: authorName,
        detail: content.length > 60 ? content.slice(0, 60) + '…' : content,
        timestamp: Date.now(),
      }
      const updatedActivity = [...(project.activity || []), activity]
      commitProjectUpdate({ ...project, nodes: updatedNodes, activity: updatedActivity, updatedAt: Date.now() })
    },

    deleteNodeComment: (nodeId, commentId) => {
      const project = get().currentProject
      if (!project) return
      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId
          ? { ...n, comments: (n.comments || []).filter((c) => c.id !== commentId) }
          : n
      )
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    addActivityEvent: (event) => {
      const project = get().currentProject
      if (!project) return
      const full: ActivityEvent = {
        ...event,
        id: generateId(),
        timestamp: Date.now(),
      }
      const updatedActivity = [...(project.activity || []), full]
      commitProjectUpdate({ ...project, activity: updatedActivity, updatedAt: Date.now() })
    },

    createSprint: (name, startDate, endDate) => {
      const project = get().currentProject
      if (!project) return ''
      const id = generateId()
      const sprint: Sprint = { id, name, startDate, endDate, nodeIds: [], status: 'planning' }
      const sprints = [...(project.sprints || []), sprint]
      commitProjectUpdate({ ...project, sprints, updatedAt: Date.now() })
      return id
    },

    updateSprint: (sprintId, updates) => {
      const project = get().currentProject
      if (!project) return
      const sprints = (project.sprints || []).map((s) =>
        s.id === sprintId ? { ...s, ...updates } : s
      )
      commitProjectUpdate({ ...project, sprints, updatedAt: Date.now() })
    },

    deleteSprint: (sprintId) => {
      const project = get().currentProject
      if (!project) return
      const sprints = (project.sprints || []).filter((s) => s.id !== sprintId)
      const updatedNodes = project.nodes.map((n) =>
        n.sprintId === sprintId ? { ...n, sprintId: undefined } : n
      )
      commitProjectUpdate({ ...project, sprints, nodes: updatedNodes, updatedAt: Date.now() })
    },

    assignNodeToSprint: (nodeId, sprintId) => {
      const project = get().currentProject
      if (!project) return
      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId ? { ...n, sprintId } : n
      )
      let sprints = [...(project.sprints || [])]
      // Remove from old sprint nodeIds
      sprints = sprints.map((s) => ({
        ...s,
        nodeIds: s.nodeIds.filter((id) => id !== nodeId),
      }))
      // Add to new sprint nodeIds
      if (sprintId) {
        sprints = sprints.map((s) =>
          s.id === sprintId ? { ...s, nodeIds: [...s.nodeIds, nodeId] } : s
        )
      }
      commitProjectUpdate({ ...project, nodes: updatedNodes, sprints, updatedAt: Date.now() })
    },

    saveVersion: (name) => {
      const project = get().currentProject
      if (!project) return ''
      const id = generateId()
      const version: ProjectVersion = {
        id,
        name,
        snapshot: {
          nodes: JSON.parse(JSON.stringify(project.nodes)),
          edges: JSON.parse(JSON.stringify(project.edges)),
          title: project.title,
          description: project.description,
        },
        parentVersionId: project.currentVersionId,
        createdAt: Date.now(),
      }
      const versions = [...(project.versions || []), version]
      commitProjectUpdate({ ...project, versions, currentVersionId: id, updatedAt: Date.now() })
      return id
    },

    restoreVersion: (versionId) => {
      const project = get().currentProject
      if (!project) return
      const version = (project.versions || []).find((v) => v.id === versionId)
      if (!version) return
      const restored = {
        ...project,
        nodes: JSON.parse(JSON.stringify(version.snapshot.nodes)),
        edges: JSON.parse(JSON.stringify(version.snapshot.edges)),
        title: version.snapshot.title,
        description: version.snapshot.description,
        currentVersionId: versionId,
        updatedAt: Date.now(),
      }
      commitProjectUpdate(restored)
    },

    deleteVersion: (versionId) => {
      const project = get().currentProject
      if (!project) return
      const versions = (project.versions || []).filter((v) => v.id !== versionId)
      const currentVersionId = project.currentVersionId === versionId ? undefined : project.currentVersionId
      commitProjectUpdate({ ...project, versions, currentVersionId, updatedAt: Date.now() })
    },

    updateNodeDocument: (nodeId, blocks) => {
      const project = get().currentProject
      if (!project) return
      const updatedNodes = project.nodes.map((n) => {
        if (n.id !== nodeId) return n
        const doc: NodeDocument = n.document
          ? { ...n.document, blocks, updatedAt: Date.now() }
          : { id: generateId(), blocks, updatedAt: Date.now() }
        return { ...n, document: doc }
      })
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    updateNodeVersion: (nodeId, version) => {
      const project = get().currentProject
      if (!project) return
      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId ? { ...n, version } : n
      )
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    updateNodeSchemaType: (nodeId, schemaType) => {
      const project = get().currentProject
      if (!project) return
      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId ? { ...n, schemaType } : n
      )
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    updateNodePromptType: (nodeId, promptType) => {
      const project = get().currentProject
      if (!project) return
      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId ? { ...n, promptType } : n
      )
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    updateNodeTargetTool: (nodeId, targetTool) => {
      const project = get().currentProject
      if (!project) return
      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId ? { ...n, targetTool } : n
      )
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    updateNodeReferenceType: (nodeId, referenceType) => {
      const project = get().currentProject
      if (!project) return
      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId ? { ...n, referenceType } : n
      )
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    updateNodeUrl: (nodeId, url) => {
      const project = get().currentProject
      if (!project) return
      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId ? { ...n, url } : n
      )
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    updateNodeAcceptanceCriteria: (nodeId, criteria) => {
      const project = get().currentProject
      if (!project) return
      const updatedNodes = project.nodes.map((n) =>
        n.id === nodeId ? { ...n, acceptanceCriteria: criteria } : n
      )
      commitProjectUpdate({ ...project, nodes: updatedNodes, updatedAt: Date.now() })
    },

    updateProjectTitle: (title) => {
      const project = get().currentProject
      if (!project) return
      commitProjectUpdate({ ...project, title, updatedAt: Date.now() })
    },

    setPages: (pages, pageEdges) => {
      const p = get().currentProject
      if (!p) return
      commitProjectUpdate({ ...p, updatedAt: Date.now(), pages, pageEdges: pageEdges || p.pageEdges || [] })
    },

    updatePageHtml: (pageId, html) => {
      const p = get().currentProject
      if (!p) return
      const pages = (p.pages || []).map((pg) => pg.id === pageId ? { ...pg, html } : pg)
      applyWithoutUndo({ ...p, updatedAt: Date.now(), pages })
    },

    updatePagePosition: (pageId, position) => {
      const p = get().currentProject
      if (!p) return
      const pages = (p.pages || []).map((pg) => pg.id === pageId ? { ...pg, position } : pg)
      applyWithoutUndo({ ...p, pages })
    },

    addPageEdge: (source, target, label) => {
      const p = get().currentProject
      if (!p) return
      const edge: PageEdge = { id: generateId(), source, target, label }
      applyWithoutUndo({ ...p, updatedAt: Date.now(), pageEdges: [...(p.pageEdges || []), edge] })
    },

    removePageEdge: (edgeId) => {
      const p = get().currentProject
      if (!p) return
      applyWithoutUndo({ ...p, updatedAt: Date.now(), pageEdges: (p.pageEdges || []).filter((e) => e.id !== edgeId) })
    },

    removePage: (pageId) => {
      const p = get().currentProject
      if (!p) return
      const pages = (p.pages || []).filter((pg) => pg.id !== pageId)
      const pageEdges = (p.pageEdges || []).filter((e) => e.source !== pageId && e.target !== pageId)
      commitProjectUpdate({ ...p, updatedAt: Date.now(), pages, pageEdges })
    },

    undo: () => {
      const { _undoStack, _redoStack, currentProject } = get()
      if (_undoStack.length === 0) return

      const previous = _undoStack[_undoStack.length - 1]
      const newUndoStack = _undoStack.slice(0, -1)
      const newRedoStack = currentProject
        ? [..._redoStack, currentProject]
        : _redoStack

      const { flowNodes, flowEdges } = planNodesToFlow(previous.nodes, previous.edges, get().flowNodes)
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

      const { flowNodes, flowEdges } = planNodesToFlow(next.nodes, next.edges, get().flowNodes)
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
