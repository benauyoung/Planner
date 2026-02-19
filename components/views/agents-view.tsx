'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  Plus,
  Sparkles,
  Trash2,
  Settings,
  BookOpen,
  Palette,
  MessageSquare,
  Rocket,
  Loader2,
  Copy,
  Check,
  X,
  FileText,
  HelpCircle,
  Globe,
  Send,
  RotateCcw,
  Shield,
  ChevronDown,
  ExternalLink,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProjectStore } from '@/stores/project-store'
import { useAgentChat, type AgentChatMessage } from '@/hooks/use-agent-chat'
import { generateId } from '@/lib/id'
import { cn } from '@/lib/utils'
import type { Agent, AgentKnowledgeEntry, AgentTheme } from '@/types/agent'

// ─── Tab Types ───────────────────────────────────────────────

type AgentTab = 'config' | 'knowledge' | 'theme' | 'preview' | 'deploy'

const TABS: { key: AgentTab; label: string; icon: typeof Settings }[] = [
  { key: 'config', label: 'Config', icon: Settings },
  { key: 'knowledge', label: 'Knowledge', icon: BookOpen },
  { key: 'theme', label: 'Theme', icon: Palette },
  { key: 'preview', label: 'Preview', icon: MessageSquare },
  { key: 'deploy', label: 'Deploy', icon: Rocket },
]

// ─── Default Agent Factory ───────────────────────────────────

function createDefaultAgent(): Agent {
  return {
    id: generateId(),
    name: 'New Agent',
    description: '',
    greeting: 'Hi there! How can I help you today?',
    persona: '',
    systemPrompt: 'You are a helpful assistant. Answer questions clearly and concisely.',
    knowledge: [],
    actions: [],
    rules: [],
    theme: {
      primaryColor: '#3b82f6',
      position: 'bottom-right',
      bubbleText: 'Chat with us!',
    },
    model: 'gemini-2.0-flash',
    isPublished: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

// ─── Main View ───────────────────────────────────────────────

export function AgentsView() {
  const currentProject = useProjectStore((s) => s.currentProject)
  const addAgent = useProjectStore((s) => s.addAgent)
  const removeAgent = useProjectStore((s) => s.removeAgent)
  const agents = currentProject?.agents || []
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<AgentTab>('config')
  const [generating, setGenerating] = useState(false)
  const [generatePrompt, setGeneratePrompt] = useState('')
  const [showGenerateModal, setShowGenerateModal] = useState(false)

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || null

  // Auto-select first agent
  useEffect(() => {
    if (!selectedAgentId && agents.length > 0) {
      setSelectedAgentId(agents[0].id)
    }
    if (selectedAgentId && !agents.find((a) => a.id === selectedAgentId)) {
      setSelectedAgentId(agents.length > 0 ? agents[0].id : null)
    }
  }, [agents, selectedAgentId])

  const handleCreateAgent = () => {
    const agent = createDefaultAgent()
    addAgent(agent)
    setSelectedAgentId(agent.id)
    setActiveTab('config')
  }

  const handleGenerateAgent = async () => {
    if (!generatePrompt.trim() || generating) return
    setGenerating(true)
    try {
      const res = await fetch('/api/agent/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: generatePrompt,
          projectTitle: currentProject?.title,
        }),
      })
      if (!res.ok) throw new Error('Failed to generate agent')
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      const agent: Agent = {
        id: generateId(),
        name: data.name || 'Generated Agent',
        description: data.description || '',
        greeting: data.greeting || 'Hi! How can I help?',
        persona: data.persona || '',
        systemPrompt: data.systemPrompt || '',
        knowledge: (data.knowledge || []).map((k: { type: string; title: string; content: string }) => ({
          id: generateId(),
          type: k.type as 'text' | 'faq',
          title: k.title,
          content: k.content,
          createdAt: Date.now(),
        })),
        actions: [],
        rules: (data.rules || []).map((r: string) => ({
          id: generateId(),
          rule: r,
        })),
        theme: {
          primaryColor: '#3b82f6',
          position: 'bottom-right',
          bubbleText: 'Chat with us!',
        },
        model: 'gemini-2.0-flash',
        isPublished: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      addAgent(agent)
      setSelectedAgentId(agent.id)
      setActiveTab('config')
      setShowGenerateModal(false)
      setGeneratePrompt('')
    } catch (err) {
      console.error('Agent generation failed:', err)
    } finally {
      setGenerating(false)
    }
  }

  const handleDeleteAgent = (agentId: string) => {
    removeAgent(agentId)
  }

  return (
    <div className="h-full flex">
      {/* Left: Agent List */}
      <div className="w-64 border-r bg-muted/20 flex flex-col shrink-0">
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Agents</h3>
            </div>
            <span className="text-xs text-muted-foreground">{agents.length}</span>
          </div>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 text-xs h-7"
              onClick={handleCreateAgent}
            >
              <Plus className="h-3 w-3" />
              New
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 text-xs h-7"
              onClick={() => setShowGenerateModal(true)}
            >
              <Sparkles className="h-3 w-3" />
              AI Generate
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {agents.length === 0 && (
            <div className="text-center py-8 px-4">
              <Bot className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                No agents yet. Create one to get started.
              </p>
            </div>
          )}
          {agents.map((agent) => (
            <div
              key={agent.id}
              role="button"
              tabIndex={0}
              onClick={() => { setSelectedAgentId(agent.id); setActiveTab('config') }}
              onKeyDown={(e) => { if (e.key === 'Enter') { setSelectedAgentId(agent.id); setActiveTab('config') } }}
              className={cn(
                'w-full text-left rounded-lg px-3 py-2 transition-colors group cursor-pointer',
                selectedAgentId === agent.id
                  ? 'bg-primary/10 border border-primary/20'
                  : 'hover:bg-muted border border-transparent'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: agent.theme.primaryColor + '20', color: agent.theme.primaryColor }}
                  >
                    <Bot className="h-3 w-3" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{agent.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {agent.isPublished ? '● Published' : '○ Draft'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteAgent(agent.id) }}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Agent Config */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedAgent ? (
          <>
            {/* Tab bar */}
            <div className="border-b px-4 py-1.5 flex items-center gap-1 bg-background">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    activeTab === tab.key
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'config' && <ConfigTab agent={selectedAgent} />}
              {activeTab === 'knowledge' && <KnowledgeTab agent={selectedAgent} />}
              {activeTab === 'theme' && <ThemeTab agent={selectedAgent} />}
              {activeTab === 'preview' && <PreviewTab agent={selectedAgent} />}
              {activeTab === 'deploy' && <DeployTab agent={selectedAgent} />}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Bot className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Select an agent or create a new one
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Generate Modal */}
      <AnimatePresence>
        {showGenerateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => !generating && setShowGenerateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background rounded-xl border shadow-xl w-full max-w-md p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Generate Agent with AI</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Describe the kind of chatbot you want and we&apos;ll generate the full configuration.
              </p>
              <textarea
                value={generatePrompt}
                onChange={(e) => setGeneratePrompt(e.target.value)}
                placeholder="e.g., A customer support bot for my SaaS product that handles billing questions, feature requests, and technical issues..."
                className="w-full h-28 px-3 py-2 text-sm border rounded-lg bg-muted/30 resize-none outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                disabled={generating}
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGenerateModal(false)}
                  disabled={generating}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleGenerateAgent}
                  disabled={!generatePrompt.trim() || generating}
                  className="gap-1.5"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Config Tab ──────────────────────────────────────────────

function ConfigTab({ agent }: { agent: Agent }) {
  const updateAgent = useProjectStore((s) => s.updateAgent)
  const addAgentRule = useProjectStore((s) => s.addAgentRule)
  const removeAgentRule = useProjectStore((s) => s.removeAgentRule)
  const [newRule, setNewRule] = useState('')

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      {/* Name */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Agent Name</label>
        <input
          type="text"
          value={agent.name}
          onChange={(e) => updateAgent(agent.id, { name: e.target.value })}
          className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="My Support Bot"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
        <input
          type="text"
          value={agent.description}
          onChange={(e) => updateAgent(agent.id, { description: e.target.value })}
          className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="A helpful support agent for my website"
        />
      </div>

      {/* Persona */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Persona</label>
        <textarea
          value={agent.persona}
          onChange={(e) => updateAgent(agent.id, { persona: e.target.value })}
          className="w-full h-20 px-3 py-2 text-sm border rounded-lg bg-background resize-none outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Friendly and professional support agent who speaks in a casual but helpful tone..."
        />
      </div>

      {/* Greeting */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Greeting Message</label>
        <input
          type="text"
          value={agent.greeting}
          onChange={(e) => updateAgent(agent.id, { greeting: e.target.value })}
          className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Hi there! How can I help you today?"
        />
        <p className="text-[10px] text-muted-foreground mt-1">First message visitors see when they open the chat.</p>
      </div>

      {/* System Prompt */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">System Prompt</label>
        <textarea
          value={agent.systemPrompt}
          onChange={(e) => updateAgent(agent.id, { systemPrompt: e.target.value })}
          className="w-full h-40 px-3 py-2 text-sm border rounded-lg bg-background resize-none outline-none focus:ring-2 focus:ring-primary/30 font-mono text-xs"
          placeholder="You are a helpful assistant for [company]. You help users with..."
        />
        <p className="text-[10px] text-muted-foreground mt-1">
          This is the core instruction that defines how your agent behaves. Be specific about tone, scope, and limitations.
        </p>
      </div>

      {/* Model */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Model</label>
        <select
          value={agent.model}
          onChange={(e) => updateAgent(agent.id, { model: e.target.value as Agent['model'] })}
          className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="gemini-2.0-flash">Gemini 2.0 Flash (fast, recommended)</option>
          <option value="gemini-1.5-pro">Gemini 1.5 Pro (more capable)</option>
        </select>
      </div>

      {/* Behavior Rules */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
          <Shield className="h-3 w-3 inline mr-1" />
          Behavior Rules
        </label>
        <div className="space-y-1.5 mb-2">
          {agent.rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/40 border text-xs group"
            >
              <span className="flex-1">{rule.rule}</span>
              <button
                onClick={() => removeAgentRule(agent.id, rule.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newRule.trim()) {
                addAgentRule(agent.id, newRule.trim())
                setNewRule('')
              }
            }}
            className="flex-1 px-3 py-1.5 text-xs border rounded-md bg-background outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="e.g., Never share internal pricing formulas"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              if (newRule.trim()) {
                addAgentRule(agent.id, newRule.trim())
                setNewRule('')
              }
            }}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Knowledge Tab ───────────────────────────────────────────

function KnowledgeTab({ agent }: { agent: Agent }) {
  const addAgentKnowledge = useProjectStore((s) => s.addAgentKnowledge)
  const removeAgentKnowledge = useProjectStore((s) => s.removeAgentKnowledge)
  const [addType, setAddType] = useState<'text' | 'faq'>('text')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const handleAdd = () => {
    if (!title.trim() || !content.trim()) return
    const entry: AgentKnowledgeEntry = {
      id: generateId(),
      type: addType,
      title: title.trim(),
      content: content.trim(),
      createdAt: Date.now(),
    }
    addAgentKnowledge(agent.id, entry)
    setTitle('')
    setContent('')
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h4 className="text-sm font-semibold mb-1">Knowledge Base</h4>
        <p className="text-xs text-muted-foreground">
          Add information your agent should know about. This gets injected as context for every conversation.
        </p>
      </div>

      {/* Add new entry */}
      <div className="border rounded-lg p-4 space-y-3 bg-muted/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddType('text')}
            className={cn(
              'px-3 py-1 rounded-md text-xs font-medium transition-colors',
              addType === 'text' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            <FileText className="h-3 w-3 inline mr-1" />
            Text
          </button>
          <button
            onClick={() => setAddType('faq')}
            className={cn(
              'px-3 py-1 rounded-md text-xs font-medium transition-colors',
              addType === 'faq' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            <HelpCircle className="h-3 w-3 inline mr-1" />
            FAQ
          </button>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-1.5 text-xs border rounded-md bg-background outline-none focus:ring-2 focus:ring-primary/30"
          placeholder={addType === 'faq' ? 'Question...' : 'Title...'}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-20 px-3 py-1.5 text-xs border rounded-md bg-background resize-none outline-none focus:ring-2 focus:ring-primary/30"
          placeholder={addType === 'faq' ? 'Answer...' : 'Content...'}
        />
        <Button size="sm" className="text-xs h-7 gap-1" onClick={handleAdd} disabled={!title.trim() || !content.trim()}>
          <Plus className="h-3 w-3" />
          Add Entry
        </Button>
      </div>

      {/* Entries list */}
      <div className="space-y-2">
        {agent.knowledge.length === 0 && (
          <div className="text-center py-6 text-xs text-muted-foreground">
            No knowledge entries yet. Add some above.
          </div>
        )}
        {agent.knowledge.map((entry) => (
          <div
            key={entry.id}
            className="border rounded-lg px-4 py-3 group hover:border-primary/20 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={cn(
                    'text-[9px] font-bold px-1.5 py-0.5 rounded uppercase',
                    entry.type === 'faq' ? 'bg-purple-500/15 text-purple-500' : 'bg-blue-500/15 text-blue-500'
                  )}>
                    {entry.type}
                  </span>
                  <span className="text-xs font-medium truncate">{entry.title}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{entry.content}</p>
              </div>
              <button
                onClick={() => removeAgentKnowledge(agent.id, entry.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0 mt-0.5"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Theme Tab ───────────────────────────────────────────────

const COLOR_PRESETS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#6366f1', '#0ea5e9', '#14b8a6', '#64748b',
]

function ThemeTab({ agent }: { agent: Agent }) {
  const updateAgentTheme = useProjectStore((s) => s.updateAgentTheme)

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h4 className="text-sm font-semibold mb-1">Widget Theme</h4>
        <p className="text-xs text-muted-foreground">
          Customize how the chat widget looks on your website.
        </p>
      </div>

      {/* Primary Color */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">Primary Color</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              onClick={() => updateAgentTheme(agent.id, { primaryColor: color })}
              className={cn(
                'w-8 h-8 rounded-full border-2 transition-all',
                agent.theme.primaryColor === color ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={agent.theme.primaryColor}
            onChange={(e) => updateAgentTheme(agent.id, { primaryColor: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border"
          />
          <input
            type="text"
            value={agent.theme.primaryColor}
            onChange={(e) => updateAgentTheme(agent.id, { primaryColor: e.target.value })}
            className="w-28 px-2 py-1 text-xs border rounded-md bg-background font-mono outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Position */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">Widget Position</label>
        <div className="flex gap-2">
          {(['bottom-right', 'bottom-left'] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => updateAgentTheme(agent.id, { position: pos })}
              className={cn(
                'px-4 py-2 rounded-lg border text-xs font-medium transition-colors',
                agent.theme.position === pos
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-muted/30 text-muted-foreground hover:text-foreground'
              )}
            >
              {pos === 'bottom-right' ? '↘ Bottom Right' : '↙ Bottom Left'}
            </button>
          ))}
        </div>
      </div>

      {/* Bubble Text */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Bubble Hover Text</label>
        <input
          type="text"
          value={agent.theme.bubbleText || ''}
          onChange={(e) => updateAgentTheme(agent.id, { bubbleText: e.target.value })}
          className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Chat with us!"
        />
      </div>

      {/* Preview */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">Preview</label>
        <div className="relative border rounded-xl bg-muted/20 h-48 overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground) / 0.3) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }} />
          <div
            className={cn(
              'absolute bottom-4',
              agent.theme.position === 'bottom-right' ? 'right-4' : 'left-4'
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform"
                style={{ backgroundColor: agent.theme.primaryColor }}
              >
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Preview Tab ─────────────────────────────────────────────

function PreviewTab({ agent }: { agent: Agent }) {
  const { messages, isLoading, error, sendMessage, resetChat } = useAgentChat(agent)
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleSend = () => {
    if (!input.trim()) return
    sendMessage(input.trim())
    setInput('')
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold">Chat Preview</h4>
          <p className="text-[10px] text-muted-foreground">Test your agent before deploying</p>
        </div>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={resetChat}>
          <RotateCcw className="h-3 w-3" />
          Reset
        </Button>
      </div>

      <div className="flex-1 flex justify-center p-6 bg-muted/10">
        {/* Chat widget mockup */}
        <div className="w-full max-w-sm border rounded-xl bg-background shadow-xl flex flex-col overflow-hidden h-full">
          {/* Widget header */}
          <div
            className="px-4 py-3 flex items-center gap-2"
            style={{ backgroundColor: agent.theme.primaryColor }}
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{agent.name}</p>
              <p className="text-[10px] text-white/70">Online</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* Greeting */}
            <div className="flex gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: agent.theme.primaryColor + '20', color: agent.theme.primaryColor }}
              >
                <Bot className="h-3 w-3" />
              </div>
              <div className="bg-muted rounded-lg rounded-tl-none px-3 py-2 text-xs max-w-[80%]">
                {agent.greeting}
              </div>
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : '')}
              >
                {msg.role === 'assistant' && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: agent.theme.primaryColor + '20', color: agent.theme.primaryColor }}
                  >
                    <Bot className="h-3 w-3" />
                  </div>
                )}
                <div
                  className={cn(
                    'rounded-lg px-3 py-2 text-xs max-w-[80%]',
                    msg.role === 'user'
                      ? 'text-white rounded-tr-none'
                      : 'bg-muted rounded-tl-none'
                  )}
                  style={msg.role === 'user' ? { backgroundColor: agent.theme.primaryColor } : undefined}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: agent.theme.primaryColor + '20', color: agent.theme.primaryColor }}
                >
                  <Bot className="h-3 w-3" />
                </div>
                <div className="bg-muted rounded-lg rounded-tl-none px-3 py-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <motion.div
                        key={d}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: agent.theme.primaryColor }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: d * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg p-2">
                {error}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t px-3 py-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 px-3 py-1.5 text-xs border rounded-full bg-muted/30 outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Type a message..."
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: agent.theme.primaryColor }}
              >
                <Send className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Deploy Tab ──────────────────────────────────────────────

function DeployTab({ agent }: { agent: Agent }) {
  const toggleAgentPublished = useProjectStore((s) => s.toggleAgentPublished)
  const currentProject = useProjectStore((s) => s.currentProject)
  const [copied, setCopied] = useState<string | null>(null)

  const shareId = currentProject?.shareId || currentProject?.id || ''
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  const embedScript = `<script
  src="${baseUrl}/widget.js"
  data-agent="${agent.id}"
  data-share="${shareId}"
  async
></script>`

  const apiEndpoint = `${baseUrl}/api/agent/${agent.id}/chat`

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h4 className="text-sm font-semibold mb-1">Deploy Agent</h4>
        <p className="text-xs text-muted-foreground">
          Publish your agent and embed it on your website.
        </p>
      </div>

      {/* Publish toggle */}
      <div className="border rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            agent.isPublished ? 'bg-green-500/15' : 'bg-muted'
          )}>
            {agent.isPublished ? (
              <Eye className="h-5 w-5 text-green-500" />
            ) : (
              <EyeOff className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">
              {agent.isPublished ? 'Published' : 'Draft'}
            </p>
            <p className="text-xs text-muted-foreground">
              {agent.isPublished
                ? 'Your agent is live and accepting conversations'
                : 'Publish to make your agent available via embed code'}
            </p>
          </div>
        </div>
        <Button
          variant={agent.isPublished ? 'outline' : 'default'}
          size="sm"
          onClick={() => toggleAgentPublished(agent.id)}
          className="gap-1.5"
        >
          {agent.isPublished ? (
            <>
              <EyeOff className="h-3.5 w-3.5" />
              Unpublish
            </>
          ) : (
            <>
              <Rocket className="h-3.5 w-3.5" />
              Publish
            </>
          )}
        </Button>
      </div>

      {/* Embed Code */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Embed Code</label>
        <p className="text-[10px] text-muted-foreground mb-2">
          Add this script tag to your website&apos;s HTML to show the chat widget.
        </p>
        <div className="relative">
          <pre className="bg-muted/40 border rounded-lg p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
            {embedScript}
          </pre>
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 h-7 text-xs gap-1"
            onClick={() => handleCopy(embedScript, 'embed')}
          >
            {copied === 'embed' ? (
              <>
                <Check className="h-3 w-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* API Endpoint */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">API Endpoint</label>
        <p className="text-[10px] text-muted-foreground mb-2">
          Use this endpoint for custom integrations. Send POST requests with a messages array.
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-muted/40 border rounded-lg px-3 py-2 text-xs font-mono truncate">
            {apiEndpoint}
          </code>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1 shrink-0"
            onClick={() => handleCopy(apiEndpoint, 'api')}
          >
            {copied === 'api' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* API Usage Example */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Usage Example</label>
        <pre className="bg-muted/40 border rounded-lg p-3 text-[10px] font-mono overflow-x-auto whitespace-pre-wrap">{`fetch("${apiEndpoint}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [{ role: "user", content: "Hello!" }],
    systemPrompt: "...",  // Agent's system prompt
    knowledge: [...],     // Knowledge entries
    rules: [...]          // Behavior rules
  })
})`}</pre>
      </div>

      {/* Agent Info */}
      <div className="border-t pt-4">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground">Agent ID</span>
            <p className="font-mono text-[10px] mt-0.5 truncate">{agent.id}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Created</span>
            <p className="mt-0.5">{new Date(agent.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Model</span>
            <p className="mt-0.5">{agent.model}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Knowledge Entries</span>
            <p className="mt-0.5">{agent.knowledge.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
