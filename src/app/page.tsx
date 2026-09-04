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
      <footer className="border-t border-zinc-200/80 bg-white py-5 dark:border-zinc-800/80 dark:bg-zinc-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 text-xs text-zinc-500 dark:text-zinc-400">
          <span>&copy; {new Date().getFullYear()} Ajaia Workspace. All rights reserved.</span>
          <span>Collaborative Document Editor</span>
        </div>
      </footer>
      <FileUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}
