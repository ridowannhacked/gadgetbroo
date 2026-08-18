"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Quote, Heading2 } from "lucide-react";

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none w-full bg-[#0a0a0a] min-h-[150px] border border-slate-700/60 rounded-b-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-wrap items-center gap-1 border border-b-0 border-slate-700/60 rounded-t-lg bg-[#12151a] p-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-slate-700 transition-colors ${
            editor.isActive("bold") ? "bg-slate-700 text-blue-400" : "text-slate-400"
          }`}
        >
          <Bold size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-slate-700 transition-colors ${
            editor.isActive("italic") ? "bg-slate-700 text-blue-400" : "text-slate-400"
          }`}
        >
          <Italic size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-slate-700 transition-colors ${
            editor.isActive("heading", { level: 2 }) ? "bg-slate-700 text-blue-400" : "text-slate-400"
          }`}
        >
          <Heading2 size={14} />
        </button>
        <div className="w-px h-4 bg-slate-700 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-slate-700 transition-colors ${
            editor.isActive("bulletList") ? "bg-slate-700 text-blue-400" : "text-slate-400"
          }`}
        >
          <List size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-slate-700 transition-colors ${
            editor.isActive("orderedList") ? "bg-slate-700 text-blue-400" : "text-slate-400"
          }`}
        >
          <ListOrdered size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-slate-700 transition-colors ${
            editor.isActive("blockquote") ? "bg-slate-700 text-blue-400" : "text-slate-400"
          }`}
        >
          <Quote size={14} />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
