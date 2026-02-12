import type { NodeType } from '@/types/project'

export interface Command {
  id: string
  label: string
  shortcut?: string
  category: 'navigation' | 'node' | 'canvas' | 'project' | 'view' | 'ai'
  icon?: string
  when?: 'always' | 'has-project' | 'has-selection'
  action: () => void
}

export type CommandFactory = (ctx: CommandContext) => Command[]

export interface CommandContext {
  hasProject: boolean
  hasSelection: boolean
  selectedNodeId: string | null
  navigate: (path: string) => void
  // Actions
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  deleteNode: (id: string) => void
  duplicateNode: (id: string, children: boolean) => string | null
  selectNode: (id: string | null) => void
  closeDetailPanel: () => void
  toggleDetailPanel: () => void
  toggleBlastRadius: () => void
  reLayout: () => void
  toggleChat: () => void
  toggleTheme: () => void
  setNodeStatus: (id: string, status: 'not_started' | 'in_progress' | 'completed' | 'blocked') => void
  fitView: () => void
  // Node search
  allNodes: { id: string; title: string; type: NodeType }[]
}

export function buildCommands(ctx: CommandContext): Command[] {
  const commands: Command[] = []

  // ── Navigation ────────────────────────────────
  commands.push({
    id: 'nav:dashboard',
    label: 'Go to Dashboard',
    shortcut: '',
    category: 'navigation',
    when: 'always',
    action: () => ctx.navigate('/dashboard'),
  })

  // ── Project ───────────────────────────────────
  commands.push({
    id: 'project:undo',
    label: 'Undo',
    shortcut: 'Ctrl+Z',
    category: 'project',
    when: 'has-project',
    action: () => ctx.undo(),
  })
  commands.push({
    id: 'project:redo',
    label: 'Redo',
    shortcut: 'Ctrl+Shift+Z',
    category: 'project',
    when: 'has-project',
    action: () => ctx.redo(),
  })

  // ── View ──────────────────────────────────────
  commands.push({
    id: 'view:toggle-detail',
    label: 'Toggle Detail Panel',
    shortcut: 'Ctrl+E',
    category: 'view',
    when: 'has-project',
    action: () => ctx.toggleDetailPanel(),
  })
  commands.push({
    id: 'view:toggle-chat',
    label: 'Toggle Chat Panel',
    shortcut: 'Ctrl+J',
    category: 'view',
    when: 'has-project',
    action: () => ctx.toggleChat(),
  })
  commands.push({
    id: 'view:toggle-theme',
    label: 'Toggle Dark / Light Theme',
    shortcut: '',
    category: 'view',
    when: 'always',
    action: () => ctx.toggleTheme(),
  })

  // ── Canvas ────────────────────────────────────
  commands.push({
    id: 'canvas:relayout',
    label: 'Re-layout Canvas',
    shortcut: 'Ctrl+L',
    category: 'canvas',
    when: 'has-project',
    action: () => ctx.reLayout(),
  })
  commands.push({
    id: 'canvas:fit-view',
    label: 'Zoom to Fit',
    shortcut: 'Ctrl+0',
    category: 'canvas',
    when: 'has-project',
    action: () => ctx.fitView(),
  })
  commands.push({
    id: 'canvas:blast-radius',
    label: 'Toggle Blast Radius',
    shortcut: 'Ctrl+B',
    category: 'canvas',
    when: 'has-project',
    action: () => ctx.toggleBlastRadius(),
  })

  // ── Node (selection-dependent) ────────────────
  if (ctx.hasSelection && ctx.selectedNodeId) {
    const nodeId = ctx.selectedNodeId
    commands.push({
      id: 'node:delete',
      label: 'Delete Selected Node',
      shortcut: 'Del',
      category: 'node',
      when: 'has-selection',
      action: () => {
        ctx.deleteNode(nodeId)
        ctx.closeDetailPanel()
      },
    })
    commands.push({
      id: 'node:duplicate',
      label: 'Duplicate Selected Node',
      shortcut: 'Ctrl+D',
      category: 'node',
      when: 'has-selection',
      action: () => ctx.duplicateNode(nodeId, false),
    })
    commands.push({
      id: 'node:duplicate-tree',
      label: 'Duplicate Node + Children',
      shortcut: '',
      category: 'node',
      when: 'has-selection',
      action: () => ctx.duplicateNode(nodeId, true),
    })
    commands.push({
      id: 'node:status-not-started',
      label: 'Set Status: Not Started',
      shortcut: '1',
      category: 'node',
      when: 'has-selection',
      action: () => ctx.setNodeStatus(nodeId, 'not_started'),
    })
    commands.push({
      id: 'node:status-in-progress',
      label: 'Set Status: In Progress',
      shortcut: '2',
      category: 'node',
      when: 'has-selection',
      action: () => ctx.setNodeStatus(nodeId, 'in_progress'),
    })
    commands.push({
      id: 'node:status-completed',
      label: 'Set Status: Completed',
      shortcut: '3',
      category: 'node',
      when: 'has-selection',
      action: () => ctx.setNodeStatus(nodeId, 'completed'),
    })
    commands.push({
      id: 'node:status-blocked',
      label: 'Set Status: Blocked',
      shortcut: '4',
      category: 'node',
      when: 'has-selection',
      action: () => ctx.setNodeStatus(nodeId, 'blocked'),
    })
  }

  // ── View Switching ────────────────────────────
  if (ctx.hasProject) {
    commands.push({
      id: 'view:canvas',
      label: 'Switch to Canvas View',
      shortcut: '',
      category: 'view',
      when: 'has-project',
      action: () => {
        const { useUIStore } = require('@/stores/ui-store')
        useUIStore.getState().setCurrentView('canvas')
      },
    })
    commands.push({
      id: 'view:list',
      label: 'Switch to List View',
      shortcut: '',
      category: 'view',
      when: 'has-project',
      action: () => {
        const { useUIStore } = require('@/stores/ui-store')
        useUIStore.getState().setCurrentView('list')
      },
    })
    commands.push({
      id: 'view:table',
      label: 'Switch to Table View',
      shortcut: '',
      category: 'view',
      when: 'has-project',
      action: () => {
        const { useUIStore } = require('@/stores/ui-store')
        useUIStore.getState().setCurrentView('table')
      },
    })
    commands.push({
      id: 'view:board',
      label: 'Switch to Board View (Kanban)',
      shortcut: '',
      category: 'view',
      when: 'has-project',
      action: () => {
        const { useUIStore } = require('@/stores/ui-store')
        useUIStore.getState().setCurrentView('board')
      },
    })
  }

  // ── AI Actions ────────────────────────────────
  if (ctx.hasProject) {
    commands.push({
      id: 'ai:audit',
      label: 'AI: Audit Plan for Gaps',
      shortcut: '',
      category: 'ai',
      when: 'has-project',
      action: () => window.dispatchEvent(new CustomEvent('ai-iterate', { detail: { action: 'audit', nodeId: ctx.selectedNodeId || '' } })),
    })
    commands.push({
      id: 'ai:risk',
      label: 'AI: Risk Assessment',
      shortcut: '',
      category: 'ai',
      when: 'has-project',
      action: () => window.dispatchEvent(new CustomEvent('ai-iterate', { detail: { action: 'risk', nodeId: ctx.selectedNodeId || '' } })),
    })
    commands.push({
      id: 'ai:suggest-deps',
      label: 'AI: Suggest Dependencies',
      shortcut: '',
      category: 'ai',
      when: 'has-project',
      action: () => window.dispatchEvent(new CustomEvent('ai-iterate', { detail: { action: 'suggest_deps', nodeId: ctx.selectedNodeId || '' } })),
    })
  }
  if (ctx.hasSelection && ctx.selectedNodeId) {
    const nodeId = ctx.selectedNodeId
    commands.push({
      id: 'ai:break-down',
      label: 'AI: Break Down Selected Node',
      shortcut: '',
      category: 'ai',
      when: 'has-selection',
      action: () => window.dispatchEvent(new CustomEvent('ai-iterate', { detail: { action: 'break_down', nodeId } })),
    })
    commands.push({
      id: 'ai:rewrite',
      label: 'AI: Rewrite Selected Node',
      shortcut: '',
      category: 'ai',
      when: 'has-selection',
      action: () => window.dispatchEvent(new CustomEvent('ai-iterate', { detail: { action: 'rewrite', nodeId } })),
    })
    commands.push({
      id: 'ai:estimate',
      label: 'AI: Estimate Selected Node',
      shortcut: '',
      category: 'ai',
      when: 'has-selection',
      action: () => window.dispatchEvent(new CustomEvent('ai-iterate', { detail: { action: 'estimate', nodeId } })),
    })
  }

  // ── Jump to node (search) ─────────────────────
  for (const node of ctx.allNodes) {
    commands.push({
      id: `jump:${node.id}`,
      label: `Go to: ${node.title}`,
      shortcut: '',
      category: 'navigation',
      when: 'has-project',
      action: () => ctx.selectNode(node.id),
    })
  }

  return commands
}

/** Simple fuzzy match — checks if all chars in query appear in target in order */
export function fuzzyMatch(query: string, target: string): { match: boolean; score: number } {
  const q = query.toLowerCase()
  const t = target.toLowerCase()

  if (q.length === 0) return { match: true, score: 1 }

  let qi = 0
  let score = 0
  let consecutive = 0

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      qi++
      consecutive++
      score += consecutive * 2
      if (ti === 0 || t[ti - 1] === ' ') score += 5 // word boundary bonus
    } else {
      consecutive = 0
    }
  }

  if (qi < q.length) return { match: false, score: 0 }
  return { match: true, score: score - q.length * 0.1 }
}
