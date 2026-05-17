"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Button from "@/components/Button";

export default function RichTextEditor({ value, onChange, onUploadImage }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: true, autolink: true, linkOnPaste: true }),
      Image.configure({ inline: false }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none focus:outline-none dark:prose-invert",
      },
    },
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (current !== next) editor.commands.setContent(next, false);
  }, [value, editor]);

  const insertImage = async () => {
    if (!onUploadImage || !editor) return;
    const url = await onUploadImage();
    if (!url) return;
    editor.chain().focus().setImage({ src: url, alt: "Blog image" }).run();
  };

  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href || "";
    const href = window.prompt("Enter URL", prev);
    if (href === null) return;
    if (!href.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: href.trim() }).run();
  };

  if (!editor) return null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-extrabold text-slate-800 hover:bg-white transition
          dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100 dark:hover:bg-blue-950/45"
        >
          Bold
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-extrabold text-slate-800 hover:bg-white transition
          dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100 dark:hover:bg-blue-950/45"
        >
          Italic
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-extrabold text-slate-800 hover:bg-white transition
          dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100 dark:hover:bg-blue-950/45"
        >
          Bullets
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-extrabold text-slate-800 hover:bg-white transition
          dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100 dark:hover:bg-blue-950/45"
        >
          Numbered
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-extrabold text-slate-800 hover:bg-white transition
          dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100 dark:hover:bg-blue-950/45"
        >
          Quote
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-extrabold text-slate-800 hover:bg-white transition
          dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100 dark:hover:bg-blue-950/45"
        >
          Divider
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-extrabold text-slate-800 hover:bg-white transition
          dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100 dark:hover:bg-blue-950/45"
        >
          H2
        </button>

        <button
          type="button"
          onClick={setLink}
          className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-extrabold text-slate-800 hover:bg-white transition
          dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100 dark:hover:bg-blue-950/45"
        >
          Link
        </button>

        <Button type="button" onClick={insertImage} className="px-4 py-2">
          Insert Image
        </Button>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-blue-400/20 dark:bg-blue-950/20">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
