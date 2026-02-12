'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, List, ListOrdered, Heading2, Undo, Redo } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder = 'Start writing...' }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[120px] px-3 py-2 text-sm',
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) return null

  return (
    <div className="border rounded-md overflow-hidden bg-background">
      <div className="flex items-center gap-0.5 px-1.5 py-1 border-b bg-muted/30">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            'p-1 rounded hover:bg-accent transition-colors',
            editor.isActive('bold') && 'bg-accent text-primary'
          )}
          title="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            'p-1 rounded hover:bg-accent transition-colors',
            editor.isActive('italic') && 'bg-accent text-primary'
          )}
          title="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <div className="w-px h-4 bg-border mx-0.5" />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            'p-1 rounded hover:bg-accent transition-colors',
            editor.isActive('heading', { level: 2 }) && 'bg-accent text-primary'
          )}
          title="Heading"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            'p-1 rounded hover:bg-accent transition-colors',
            editor.isActive('bulletList') && 'bg-accent text-primary'
          )}
          title="Bullet List"
        >
          <List className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            'p-1 rounded hover:bg-accent transition-colors',
            editor.isActive('orderedList') && 'bg-accent text-primary'
          )}
          title="Numbered List"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </button>
        <div className="w-px h-4 bg-border mx-0.5" />
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1 rounded hover:bg-accent transition-colors disabled:opacity-30"
          title="Undo"
        >
          <Undo className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1 rounded hover:bg-accent transition-colors disabled:opacity-30"
          title="Redo"
        >
          <Redo className="h-3.5 w-3.5" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
