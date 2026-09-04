"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import {
  FileText,
  Plus,
  Upload,
  Search,
  Users,
  Clock,
  Crown,
  Eye,
  Edit3,
  Trash2,
  Share2,
  Sparkles,
  ArrowRight,
  Filter,
} from "lucide-react";
import { FileUploadModal } from "./FileUploadModal";
import { ShareModal } from "./ShareModal";

export function DocumentDashboard() {
  const router = useRouter();
  const { currentUser } = useUser();

  const [ownedDocs, setOwnedDocs] = useState<any[]>([]);
  const [sharedDocs, setSharedDocs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "owned" | "shared">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [shareModalDoc, setShareModalDoc] = useState<any | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/documents?userId=${currentUser.id}`, {
        headers: { "x-user-id": currentUser.id },
      });
      if (res.ok) {
        const data = await res.json();
        setOwnedDocs(data.owned || []);
        setSharedDocs(data.shared || []);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleCreateDocument = async () => {
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.id,
        },
        body: JSON.stringify({
          title: "Untitled Document",
          content: "<p>Start typing here...</p>",
          userId: currentUser.id,
        }),
      });

      if (res.ok) {
        const newDoc = await res.json();
        router.push(`/documents/${newDoc.id}`);
      }
    } catch (err) {
      console.error("Error creating document:", err);
    }
  };

  const handleDeleteDocument = async (docId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const res = await fetch(`/api/documents/${docId}?userId=${currentUser.id}`, {
        method: "DELETE",
        headers: { "x-user-id": currentUser.id },
      });
      if (res.ok) {
        fetchDocuments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter docs
  const filteredOwned = ownedDocs.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredShared = sharedDocs.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allFilteredDocs =
    activeTab === "owned"
      ? filteredOwned
      : activeTab === "shared"
      ? filteredShared
      : [
          ...filteredOwned.map((d) => ({ ...d, isOwnedByUser: true })),
          ...filteredShared.map((d) => ({ ...d, isOwnedByUser: false })),
        ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Assessment Context Banner */}
      <div className="mb-8 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/90 via-blue-50/50 to-purple-50/40 p-5 dark:border-indigo-950 dark:from-indigo-950/40 dark:via-blue-950/20 dark:to-purple-950/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-indigo-600 p-2.5 text-white shadow-md shadow-indigo-600/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  Ajaia AI-Native Document Workspace
                </h1>
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300">
                  Live Assessment Build
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 max-w-2xl">
                Logged in as <strong>{currentUser.name}</strong> ({currentUser.roleTitle}).
                Switch users in the top-right header to test isolated ownership, role-based sharing (Viewer vs Editor), and live file imports.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 transition-colors"
            >
              <Upload className="h-4 w-4 text-zinc-500" />
              Import .md / .txt
            </button>
            <button
              onClick={handleCreateDocument}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Document
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === "all"
                ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            All Docs ({ownedDocs.length + sharedDocs.length})
          </button>
          <button
            onClick={() => setActiveTab("owned")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === "owned"
                ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Crown className="h-3 w-3 text-amber-500" />
            Owned by Me ({ownedDocs.length})
          </button>
          <button
            onClick={() => setActiveTab("shared")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === "shared"
                ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Users className="h-3 w-3 text-indigo-500" />
            Shared with Me ({sharedDocs.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-4 py-1.5 text-xs text-zinc-800 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          />
        </div>
      </div>

      {/* Document Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl border border-zinc-200 bg-white p-5 animate-pulse dark:border-zinc-800 dark:bg-zinc-900"
            />
          ))}
        </div>
      ) : allFilteredDocs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <FileText className="mx-auto h-10 w-10 text-zinc-400" />
          <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            No documents found
          </h3>
          <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
            {searchQuery
              ? `No results matching "${searchQuery}". Try clearing the search query.`
              : activeTab === "shared"
              ? "No documents have been shared with this user yet. Switch to another user or share a document."
              : "Create a new document or import a markdown file to get started."}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <Upload className="h-3.5 w-3.5" /> Import File
            </button>
            <button
              onClick={handleCreateDocument}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
            >
              <Plus className="h-3.5 w-3.5" /> New Document
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allFilteredDocs.map((doc) => {
            const isOwned = doc.ownerId === currentUser.id;
            const permission = isOwned ? "OWNER" : doc.myPermission || "VIEWER";

            return (
              <div
                key={doc.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800 transition-all"
              >
                <div>
                  {/* Card Header: Ownership Badge & Actions */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {isOwned ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/60 dark:text-amber-300">
                        <Crown className="h-3 w-3" />
                        Owned by me
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-950/60 dark:text-indigo-300">
                        <Users className="h-3 w-3" />
                        Shared by {doc.owner?.name?.split(" ")[0]}
                      </span>
                    )}

                    <div className="flex items-center gap-1">
                      {/* Permission indicator */}
                      <span
                        className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          permission === "OWNER"
                            ? "text-zinc-500"
                            : permission === "EDITOR"
                            ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50"
                            : "text-zinc-500 bg-zinc-100 dark:bg-zinc-800"
                        }`}
                      >
                        {permission === "EDITOR" && <Edit3 className="h-2.5 w-2.5" />}
                        {permission === "VIEWER" && <Eye className="h-2.5 w-2.5" />}
                        {permission}
                      </span>

                      {/* Share modal trigger (owner only) */}
                      {isOwned && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setShareModalDoc(doc);
                          }}
                          className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                          title="Share document"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Delete (owner only) */}
                      {isOwned && (
                        <button
                          onClick={(e) => handleDeleteDocument(doc.id, e)}
                          className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                          title="Delete document"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Preview */}
                  <Link href={`/documents/${doc.id}`} className="block group-hover:text-indigo-600">
                    <h2 className="text-sm font-semibold text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400 line-clamp-1">
                      {doc.title}
                    </h2>
                    <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {doc.content
                        ? doc.content.replace(/<[^>]*>?/gm, " ").trim() || "Empty document"
                        : "Empty document"}
                    </p>
                  </Link>
                </div>

                {/* Card Footer: Metadata & Avatars */}
                <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <img
                      src={doc.owner?.avatar}
                      alt={doc.owner?.name}
                      className="h-6 w-6 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-700"
                      title={`Owner: ${doc.owner?.name}`}
                    />
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <Link
                    href={`/documents/${doc.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Open <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          fetchDocuments();
        }}
      />

      {shareModalDoc && (
        <ShareModal
          isOpen={!!shareModalDoc}
          onClose={() => setShareModalDoc(null)}
          documentId={shareModalDoc.id}
          documentTitle={shareModalDoc.title}
          owner={shareModalDoc.owner}
          shares={shareModalDoc.shares || []}
          onSharesUpdated={() => {
            fetchDocuments();
          }}
        />
      )}
    </div>
  );
}
