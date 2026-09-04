"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { DocumentDashboard } from "@/components/DocumentDashboard";
import { FileUploadModal } from "@/components/FileUploadModal";

export default function Home() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50 dark:bg-zinc-950">
      <Navbar onOpenUpload={() => setIsUploadOpen(true)} />
      <main className="flex-1">
        <DocumentDashboard />
      </main>
      <footer className="border-t border-zinc-200/80 bg-white py-6 dark:border-zinc-800/80 dark:bg-zinc-900/50">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between px-4 sm:px-6 text-xs text-zinc-500 dark:text-zinc-400">
          <div>
            Built for <strong>Ajaia LLC</strong> • AI-Native Full Stack Developer Assessment
          </div>
          <div className="mt-2 sm:mt-0 flex items-center gap-4">
            <span>Persistence: SQLite + Prisma</span>
            <span>Editor: TipTap ProseMirror</span>
            <span>AI: Integrated Copilot</span>
          </div>
        </div>
      </footer>
      <FileUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}
