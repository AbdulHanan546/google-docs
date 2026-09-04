"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { UploadCloud, X, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FileUploadModal({ isOpen, onClose }: FileUploadModalProps) {
  const { currentUser } = useUser();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setErrorMsg(null);
    const ext = file.name.split(".").pop()?.toLowerCase();
    const valid = ["md", "markdown", "txt", "text", "json"].includes(ext || "");

    if (!valid) {
      setErrorMsg("Please choose a supported format: Markdown (.md), Plain Text (.txt), or JSON.");
      return;
    }

    setSelectedFile(file);
    try {
      const text = await file.text();
      setFilePreview(text.slice(0, 300) + (text.length > 300 ? "..." : ""));
    } catch {
      setFilePreview("(Unable to preview text)");
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setErrorMsg(null);

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("userId", currentUser.id);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "x-user-id": currentUser.id,
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to upload file");
      }

      const newDoc = await res.json();
      onClose();
      router.push(`/documents/${newDoc.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Import File to Document
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Convert markdown or text files into an editable collaborative doc
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-7 text-center cursor-pointer transition-all ${
            dragActive
              ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30"
              : selectedFile
              ? "border-emerald-400 bg-emerald-50/30 dark:border-emerald-900/60 dark:bg-emerald-950/20"
              : "border-zinc-200 hover:border-zinc-300 bg-zinc-50/60 dark:border-zinc-800 dark:hover:border-zinc-700 dark:bg-zinc-900/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,.txt,.json"
            onChange={handleChange}
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-10 w-10 text-emerald-500 mb-2" />
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {selectedFile.name}
              </p>
              <p className="text-xs text-zinc-500">
                {(selectedFile.size / 1024).toFixed(1)} KB • Click to choose another file
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-zinc-100 p-3 dark:bg-zinc-800 mb-3">
                <FileText className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
              </div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                Drag & drop your file here, or <span className="text-indigo-600 font-semibold dark:text-indigo-400">browse</span>
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Supports Markdown (.md) and Plain Text (.txt)
              </p>
            </div>
          )}
        </div>

        {/* Preview snippet */}
        {filePreview && (
          <div className="mt-4 rounded-lg bg-zinc-50 p-3 border border-zinc-100 dark:bg-zinc-950 dark:border-zinc-800">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              File Content Preview
            </span>
            <pre className="text-xs text-zinc-600 dark:text-zinc-300 font-mono whitespace-pre-wrap max-h-24 overflow-y-auto">
              {filePreview}
            </pre>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mt-3 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedFile || isUploading}
            onClick={handleUploadSubmit}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isUploading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isUploading ? "Importing..." : "Create Document"}
          </button>
        </div>
      </div>
    </div>
  );
}
