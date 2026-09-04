"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { TipTapEditor } from "@/components/TipTapEditor";

export default function DocumentEditorPage() {
  const params = useParams();
  const documentId = params?.id as string;

  if (!documentId) return null;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar isEditorPage={true} />
      <div className="flex-1">
        <TipTapEditor documentId={documentId} />
      </div>
    </div>
  );
}
