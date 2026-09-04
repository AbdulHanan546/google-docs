"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo2,
  Redo2,
  Share2,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  Lock,
  ArrowLeft,
  ChevronDown,
  Loader2,
  Trash2,
  Copy,
} from "lucide-react";
import LinkNext from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { ShareModal } from "./ShareModal";

interface TipTapEditorProps {
  documentId: string;
}

export function TipTapEditor({ documentId }: TipTapEditorProps) {
  const router = useRouter();
  const { currentUser } = useUser();

  const [documentData, setDocumentData] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error" | "readonly">("saved");
  const [lastSavedTime, setLastSavedTime] = useState<string>("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isViewer = documentData?.permission === "VIEWER";
  const isOwner = documentData?.isOwner || documentData?.ownerId === currentUser.id;

  // Auto-save debounce ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch document
  const fetchDoc = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/documents/${documentId}?userId=${currentUser.id}`, {
        headers: { "x-user-id": currentUser.id },
      });

      if (!res.ok) {
        if (res.status === 403) {
          setSaveStatus("error");
          alert("Access Denied: You do not have permission to access this document.");
          router.push("/");
          return;
        }
        throw new Error("Failed to load document");
      }

      const data = await res.json();
      setDocumentData(data);
      setTitle(data.title);
      setSaveStatus(data.permission === "VIEWER" ? "readonly" : "saved");
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
    } finally {
      setIsLoading(false);
    }
  }, [documentId, currentUser.id, router]);

  useEffect(() => {
    fetchDoc();
  }, [fetchDoc]);

  // TipTap instance
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder: "Type your document content here...",
      }),
      Link.configure({
        openOnClick: false,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: "",
    editable: !isViewer,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (isViewer) return;
      triggerDebouncedSave(title, editor.getHTML());
    },
  });

  // Sync content when doc data loads
  useEffect(() => {
    if (editor && documentData && !editor.isDestroyed) {
      const currentContent = editor.getHTML();
      if (currentContent !== documentData.content) {
        editor.commands.setContent(documentData.content || "<p></p>");
      }
      editor.setEditable(documentData.permission !== "VIEWER");
      if (documentData.permission === "VIEWER") {
        setSaveStatus("readonly");
      }
    }
  }, [editor, documentData]);

  // Debounced auto-save function
  const triggerDebouncedSave = (newTitle: string, newContent: string) => {
    if (isViewer) return;
    setSaveStatus("saving");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/documents/${documentId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": currentUser.id,
          },
          body: JSON.stringify({
            title: newTitle,
            content: newContent,
            userId: currentUser.id,
          }),
        });

        if (res.ok) {
          setSaveStatus("saved");
          const now = new Date();
          setLastSavedTime(
            now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
          );
        } else {
          setSaveStatus("error");
        }
      } catch (err) {
        console.error("Autosave error:", err);
        setSaveStatus("error");
      }
    }, 800);
  };

  // Title change handler
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (editor) {
      triggerDebouncedSave(newTitle, editor.getHTML());
    }
  };

  // Export handlers
  const handleExportMarkdown = () => {
    if (!editor) return;
    const cleanText = editor.getText();
    const blob = new Blob([`# ${title}\n\n${cleanText}`], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-") || "document"}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setExportDropdownOpen(false);
  };

  const handlePrintPdf = () => {
    window.print();
    setExportDropdownOpen(false);
  };

  // Delete handler
  const handleDeleteDocument = async () => {
    if (!isOwner) return;
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/documents/${documentId}?userId=${currentUser.id}`, {
        method: "DELETE",
        headers: { "x-user-id": currentUser.id },
      });

      if (res.ok) {
        router.push("/");
      } else {
        alert("Failed to delete document");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting document");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium text-zinc-500">Loading document workspace...</p>
        </div>
      </div>
    );
  }

  if (!documentData) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Document Not Found</h2>
        <p className="mt-2 text-sm text-zinc-500">
          The requested document could not be located or you don&apos;t have access.
        </p>
        <LinkNext
          href="/"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Dashboard
        </LinkNext>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/60 pb-24 dark:bg-zinc-950">
      {/* Top Header Bar */}
      <div className="sticky top-16 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6">
          {/* Left: Back & Editable Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <LinkNext
              href="/"
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </LinkNext>

            <div className="flex flex-col min-w-0 flex-1">
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                disabled={isViewer}
                placeholder="Untitled Document"
                className="w-full truncate bg-transparent text-base font-semibold text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 rounded px-1.5 py-0.5 dark:text-zinc-100 disabled:opacity-80"
              />
              <div className="flex items-center gap-2 px-1.5">
                {saveStatus === "saving" && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
                    <Loader2 className="h-3 w-3 animate-spin" /> Saving changes...
                  </span>
                )}
                {saveStatus === "saved" && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    Saved {lastSavedTime ? `at ${lastSavedTime}` : "to cloud"}
                  </span>
                )}
                {saveStatus === "readonly" && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                    <Lock className="h-3 w-3" /> View-only access
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="h-3 w-3 text-zinc-400" />
              </button>

              {exportDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setExportDropdownOpen(false)}
                  />
                  <div className="absolute right-0 z-50 mt-1 w-48 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                    <button
                      onClick={handleExportMarkdown}
                      className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      <Download className="h-3.5 w-3.5 text-indigo-500" />
                      Export as Markdown (.md)
                    </button>
                    <button
                      onClick={handlePrintPdf}
                      className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      <Printer className="h-3.5 w-3.5 text-cyan-500" />
                      Print / PDF
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Share Button */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
              <span className="rounded-full bg-indigo-200/60 px-1.5 py-0.2 text-[10px] dark:bg-indigo-800/80">
                {documentData.shares?.length || 0}
              </span>
            </button>

            {/* Delete (Owner only) */}
            {isOwner && (
              <button
                onClick={handleDeleteDocument}
                disabled={isDeleting}
                className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Delete document"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Rich Text Toolbar (Disabled in read-only mode) */}
        {!isViewer && editor && (
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 border-t border-zinc-100 px-4 py-1.5 sm:px-6 dark:border-zinc-800/80">
            {/* Undo / Redo */}
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="rounded p-1.5 text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-300 dark:hover:bg-zinc-800"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="rounded p-1.5 text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-300 dark:hover:bg-zinc-800"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-4 w-4" />
            </button>

            <div className="mx-1.5 h-4 w-px bg-zinc-200 dark:bg-zinc-700" />

            {/* Headings */}
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`rounded p-1.5 text-xs font-bold transition-colors ${
                editor.isActive("heading", { level: 1 })
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`rounded p-1.5 text-xs font-bold transition-colors ${
                editor.isActive("heading", { level: 2 })
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`rounded p-1.5 text-xs font-bold transition-colors ${
                editor.isActive("heading", { level: 3 })
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
              title="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </button>

            <div className="mx-1.5 h-4 w-px bg-zinc-200 dark:bg-zinc-700" />

            {/* Inline Formatting */}
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`rounded p-1.5 transition-colors ${
                editor.isActive("bold")
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`rounded p-1.5 transition-colors ${
                editor.isActive("italic")
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`rounded p-1.5 transition-colors ${
                editor.isActive("underline")
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
              title="Underline (Ctrl+U)"
            >
              <UnderlineIcon className="h-4 w-4" />
            </button>

            <div className="mx-1.5 h-4 w-px bg-zinc-200 dark:bg-zinc-700" />

            {/* Lists */}
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`rounded p-1.5 transition-colors ${
                editor.isActive("bulletList")
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
              title="Bulleted List"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`rounded p-1.5 transition-colors ${
                editor.isActive("orderedList")
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`rounded p-1.5 transition-colors ${
                editor.isActive("blockquote")
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
              title="Blockquote"
            >
              <Quote className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`rounded p-1.5 transition-colors ${
                editor.isActive("codeBlock")
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
              title="Code Block"
            >
              <Code className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Read-Only Notice for Viewers */}
      {isViewer && (
        <div className="mx-auto max-w-4xl px-4 pt-4 print:hidden">
          <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 shrink-0 text-amber-600" />
              <span>
                <strong>View-Only Mode:</strong> You do not have edit rights on this document.
                Switch to an authorized user or ask the owner (<strong>{documentData.owner?.name}</strong>) for editor access.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Document Body Canvas (Google Docs style page) */}
      <main className="mx-auto mt-6 max-w-4xl px-4 sm:px-6">
        <div className="min-h-[750px] rounded-2xl border border-zinc-200/80 bg-white p-8 sm:p-14 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 print:border-none print:shadow-none print:p-0">
          <EditorContent editor={editor} className="tiptap-prose" />
        </div>
      </main>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        documentId={documentId}
        documentTitle={title}
        owner={documentData.owner}
        shares={documentData.shares || []}
        onSharesUpdated={fetchDoc}
      />
    </div>
  );
}
