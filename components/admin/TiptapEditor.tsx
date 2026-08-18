"use client";

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Undo, Redo } from 'lucide-react';
import { useEffect } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 p-2 border-b border-border bg-card rounded-t-lg">
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-accent ${editor.isActive('bold') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
      >
        <Bold size={18} />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-accent ${editor.isActive('italic') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
      >
        <Italic size={18} />
      </button>
      <div className="w-px h-6 bg-border mx-1 self-center" />
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}
        className={`p-2 rounded hover:bg-accent ${editor.isActive('heading', { level: 2 }) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
      >
        <Heading2 size={18} />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 3 }).run(); }}
        className={`p-2 rounded hover:bg-accent ${editor.isActive('heading', { level: 3 }) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
      >
        <Heading3 size={18} />
      </button>
      <div className="w-px h-6 bg-border mx-1 self-center" />
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
        className={`p-2 rounded hover:bg-accent ${editor.isActive('bulletList') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
      >
        <List size={18} />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
        className={`p-2 rounded hover:bg-accent ${editor.isActive('orderedList') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
      >
        <ListOrdered size={18} />
      </button>
      <div className="w-px h-6 bg-border mx-1 self-center" />
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().undo().run(); }}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-2 rounded text-muted-foreground hover:bg-accent disabled:opacity-50"
      >
        <Undo size={18} />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().redo().run(); }}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-2 rounded text-muted-foreground hover:bg-accent disabled:opacity-50"
      >
        <Redo size={18} />
      </button>
    </div>
  );
};

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4 bg-background rounded-b-lg text-foreground',
      },
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
