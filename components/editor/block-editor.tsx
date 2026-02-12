'use client'

import { useState, useCallback, useRef } from 'react'
import {
  Plus,
  Trash2,
  GripVertical,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Code,
  CheckSquare,
  Minus,
  MessageSquare,
  ChevronDown,
} from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { generateId } from '@/lib/id'
import { cn } from '@/lib/utils'
import type { DocumentBlock } from '@/types/project'

const BLOCK_TYPES: {
  type: DocumentBlock['type']
  label: string
  icon: React.ReactNode
}[] = [
  { type: 'paragraph', label: 'Text', icon: <Type className="h-3.5 w-3.5" /> },
  { type: 'heading', label: 'Heading 1', icon: <Heading1 className="h-3.5 w-3.5" /> },
  { type: 'code', label: 'Code', icon: <Code className="h-3.5 w-3.5" /> },
  { type: 'checklist', label: 'Checklist', icon: <CheckSquare className="h-3.5 w-3.5" /> },
  { type: 'divider', label: 'Divider', icon: <Minus className="h-3.5 w-3.5" /> },
  { type: 'callout', label: 'Callout', icon: <MessageSquare className="h-3.5 w-3.5" /> },
]

function createBlock(type: DocumentBlock['type']): DocumentBlock {
  const id = generateId()
  switch (type) {
    case 'heading':
      return { id, type: 'heading', level: 1, content: '' }
    case 'paragraph':
      return { id, type: 'paragraph', content: '' }
    case 'code':
      return { id, type: 'code', language: 'typescript', content: '' }
    case 'checklist':
      return { id, type: 'checklist', items: [{ text: '', checked: false }] }
    case 'divider':
      return { id, type: 'divider' }
    case 'callout':
      return { id, type: 'callout', emoji: '💡', content: '' }
  }
}

interface BlockEditorProps {
  nodeId: string
  blocks: DocumentBlock[]
}

export function BlockEditor({ nodeId, blocks }: BlockEditorProps) {
  const updateNodeDocument = useProjectStore((s) => s.updateNodeDocument)
  const [addMenuOpen, setAddMenuOpen] = useState<number | null>(null)
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  const commitBlocks = useCallback(
    (updated: DocumentBlock[]) => {
      updateNodeDocument(nodeId, updated)
    },
    [nodeId, updateNodeDocument]
  )

  const updateBlock = (index: number, patch: Partial<DocumentBlock>) => {
    const updated = blocks.map((b, i) => (i === index ? { ...b, ...patch } as DocumentBlock : b))
    commitBlocks(updated)
  }

  const deleteBlock = (index: number) => {
    commitBlocks(blocks.filter((_, i) => i !== index))
  }

  const insertBlock = (afterIndex: number, type: DocumentBlock['type']) => {
    const newBlock = createBlock(type)
    const updated = [...blocks]
    updated.splice(afterIndex + 1, 0, newBlock)
    commitBlocks(updated)
    setAddMenuOpen(null)
  }

  const handleDragStart = (idx: number) => setDragIdx(idx)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }
  const handleDrop = (targetIdx: number) => {
    if (dragIdx === null || dragIdx === targetIdx) return
    const updated = [...blocks]
    const [moved] = updated.splice(dragIdx, 1)
    updated.splice(targetIdx, 0, moved)
    commitBlocks(updated)
    setDragIdx(null)
  }

  return (
    <div className="space-y-1">
      {blocks.length === 0 && (
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground mb-2">No content yet</p>
          <button
            onClick={() => insertBlock(-1, 'paragraph')}
            className="text-xs text-primary hover:underline"
          >
            + Add a block
          </button>
        </div>
      )}

      {blocks.map((block, idx) => (
        <div
          key={block.id}
          className="group relative flex gap-1"
          draggable
          onDragStart={() => handleDragStart(idx)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(idx)}
        >
          {/* Left controls */}
          <div className="flex flex-col items-center gap-0.5 pt-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 w-6">
            <button
              className="text-muted-foreground hover:text-foreground cursor-grab"
              title="Drag to reorder"
            >
              <GripVertical className="h-3 w-3" />
            </button>
            <div className="relative">
              <button
                onClick={() => setAddMenuOpen(addMenuOpen === idx ? null : idx)}
                className="text-muted-foreground hover:text-primary"
                title="Add block below"
              >
                <Plus className="h-3 w-3" />
              </button>
              {addMenuOpen === idx && (
                <div className="absolute left-6 top-0 z-50 bg-background border rounded-lg shadow-lg py-1 w-36">
                  {BLOCK_TYPES.map((bt) => (
                    <button
                      key={bt.type}
                      onClick={() => insertBlock(idx, bt.type)}
                      className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-muted transition-colors"
                    >
                      {bt.icon}
                      {bt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => deleteBlock(idx)}
              className="text-muted-foreground hover:text-red-500"
              title="Delete block"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>

          {/* Block content */}
          <div className="flex-1 min-w-0">
            <BlockRenderer
              block={block}
              onChange={(patch) => updateBlock(idx, patch)}
            />
          </div>
        </div>
      ))}

      {/* Add block at end */}
      {blocks.length > 0 && (
        <div className="relative pt-1">
          <button
            onClick={() => setAddMenuOpen(addMenuOpen === -1 ? null : -1)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-7"
          >
            <Plus className="h-3 w-3" />
            Add block
          </button>
          {addMenuOpen === -1 && (
            <div className="absolute left-7 top-6 z-50 bg-background border rounded-lg shadow-lg py-1 w-36">
              {BLOCK_TYPES.map((bt) => (
                <button
                  key={bt.type}
                  onClick={() => insertBlock(blocks.length - 1, bt.type)}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-muted transition-colors"
                >
                  {bt.icon}
                  {bt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface BlockRendererProps {
  block: DocumentBlock
  onChange: (patch: Partial<DocumentBlock>) => void
}

function BlockRenderer({ block, onChange }: BlockRendererProps) {
  switch (block.type) {
    case 'heading':
      return (
        <input
          type="text"
          value={block.content}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder={`Heading ${block.level}`}
          className={cn(
            'w-full bg-transparent outline-none font-bold placeholder:text-muted-foreground/40',
            block.level === 1 && 'text-lg',
            block.level === 2 && 'text-base',
            block.level === 3 && 'text-sm'
          )}
        />
      )

    case 'paragraph':
      return (
        <textarea
          value={block.content}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder="Type something..."
          className="w-full bg-transparent outline-none text-sm resize-none min-h-[24px] placeholder:text-muted-foreground/40 leading-relaxed"
          rows={Math.max(1, block.content.split('\n').length)}
        />
      )

    case 'code':
      return (
        <div className="rounded-md border bg-muted/30 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-1 border-b bg-muted/20">
            <select
              value={block.language}
              onChange={(e) => onChange({ language: e.target.value })}
              className="text-[10px] bg-transparent outline-none text-muted-foreground cursor-pointer"
            >
              {['typescript', 'javascript', 'python', 'rust', 'go', 'html', 'css', 'sql', 'bash', 'json', 'yaml', 'markdown'].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <textarea
            value={block.content}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder="// code here"
            className="w-full bg-transparent outline-none text-xs font-mono px-3 py-2 resize-none min-h-[60px] placeholder:text-muted-foreground/40"
            rows={Math.max(3, block.content.split('\n').length)}
          />
        </div>
      )

    case 'checklist':
      return (
        <ChecklistRenderer
          items={block.items}
          onChange={(items) => onChange({ items })}
        />
      )

    case 'divider':
      return <hr className="border-border my-2" />

    case 'callout':
      return (
        <div className="flex gap-2 rounded-md border bg-muted/20 p-3">
          <span className="text-lg shrink-0">{block.emoji}</span>
          <textarea
            value={block.content}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder="Callout content..."
            className="flex-1 bg-transparent outline-none text-sm resize-none min-h-[24px] placeholder:text-muted-foreground/40 leading-relaxed"
            rows={Math.max(1, block.content.split('\n').length)}
          />
        </div>
      )

    default:
      return null
  }
}

interface ChecklistRendererProps {
  items: { text: string; checked: boolean }[]
  onChange: (items: { text: string; checked: boolean }[]) => void
}

function ChecklistRenderer({ items, onChange }: ChecklistRendererProps) {
  const toggleItem = (idx: number) => {
    onChange(items.map((item, i) => (i === idx ? { ...item, checked: !item.checked } : item)))
  }

  const updateText = (idx: number, text: string) => {
    onChange(items.map((item, i) => (i === idx ? { ...item, text } : item)))
  }

  const addItem = () => {
    onChange([...items, { text: '', checked: false }])
  }

  const removeItem = (idx: number) => {
    if (items.length <= 1) return
    onChange(items.filter((_, i) => i !== idx))
  }

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const updated = [...items]
      updated.splice(idx + 1, 0, { text: '', checked: false })
      onChange(updated)
    }
    if (e.key === 'Backspace' && items[idx].text === '' && items.length > 1) {
      e.preventDefault()
      removeItem(idx)
    }
  }

  return (
    <div className="space-y-0.5">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2 group/item">
          <button
            onClick={() => toggleItem(idx)}
            className={cn(
              'w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors',
              item.checked
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-muted-foreground/30 hover:border-primary'
            )}
          >
            {item.checked && (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <input
            type="text"
            value={item.text}
            onChange={(e) => updateText(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            placeholder="Todo item..."
            className={cn(
              'flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/40',
              item.checked && 'line-through text-muted-foreground'
            )}
          />
          <button
            onClick={() => removeItem(idx)}
            className="opacity-0 group-hover/item:opacity-100 text-muted-foreground hover:text-red-500 transition-all shrink-0"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      ))}
      <button
        onClick={addItem}
        className="text-[10px] text-muted-foreground hover:text-primary transition-colors pl-6"
      >
        + Add item
      </button>
    </div>
  )
}
