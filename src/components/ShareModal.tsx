"use client";

import React, { useState } from "react";
import { useUser } from "@/context/UserContext";
import {
  Share2,
  X,
  ShieldCheck,
  UserPlus,
  Trash2,
  Check,
  Loader2,
  Crown,
  Eye,
  Edit3,
} from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle: string;
  owner: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    roleTitle?: string;
  };
  shares: Array<{
    id: string;
    permission: string;
    userId: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatar: string;
      roleTitle?: string;
    };
  }>;
  onSharesUpdated: () => void;
}

export function ShareModal({
  isOpen,
  onClose,
  documentId,
  documentTitle,
  owner,
  shares,
  onSharesUpdated,
}: ShareModalProps) {
  const { currentUser, allUsers } = useUser();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedPermission, setSelectedPermission] = useState<"EDITOR" | "VIEWER">("EDITOR");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  if (!isOpen) return null;

  const isOwner = currentUser.id === owner.id;

  // Potential users to add (exclude owner)
  const candidateUsers = allUsers.filter((u) => u.id !== owner.id);

  const handleAddOrUpdateShare = async (targetUserId?: string, targetPerm?: "EDITOR" | "VIEWER") => {
    const uId = targetUserId || selectedUserId;
    const perm = targetPerm || selectedPermission;

    if (!uId) return;

    try {
      setIsSubmitting(true);
      setStatusMsg(null);

      const res = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.id,
        },
        body: JSON.stringify({
          documentId,
          targetUserId: uId,
          permission: perm,
          userId: currentUser.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update share permission");
      }

      setStatusMsg({ type: "success", text: "Permissions updated successfully!" });
      setSelectedUserId("");
      onSharesUpdated();
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to share" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeShare = async (targetUserId: string) => {
    try {
      setIsSubmitting(true);
      setStatusMsg(null);

      const res = await fetch(
        `/api/share?documentId=${documentId}&targetUserId=${targetUserId}&userId=${currentUser.id}`,
        {
          method: "DELETE",
          headers: {
            "x-user-id": currentUser.id,
          },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to revoke share");
      }

      setStatusMsg({ type: "success", text: "Access revoked." });
      onSharesUpdated();
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to revoke" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Share &quot;{documentTitle}&quot;
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Manage team collaborator access and editing roles
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

        {/* Status notification */}
        {statusMsg && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-lg p-2.5 text-xs ${
              statusMsg.type === "success"
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                : "bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300"
            }`}
          >
            {statusMsg.type === "success" ? (
              <Check className="h-4 w-4 shrink-0" />
            ) : (
              <X className="h-4 w-4 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Add User Section (Only for owner) */}
        {isOwner ? (
          <div className="mt-5 space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Add Collaborator
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="min-w-0 flex-1 h-9 rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <option value="">Select a team member...</option>
                {candidateUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.roleTitle})
                  </option>
                ))}
              </select>

              <select
                value={selectedPermission}
                onChange={(e) => setSelectedPermission(e.target.value as "EDITOR" | "VIEWER")}
                className="shrink-0 h-9 rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <option value="EDITOR">Editor</option>
                <option value="VIEWER">Viewer</option>
              </select>

              <button
                type="button"
                disabled={!selectedUserId || isSubmitting}
                onClick={() => handleAddOrUpdateShare()}
                className="shrink-0 h-9 inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
              >
                {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                <span>Share</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
            Only the document owner can grant or revoke collaborator access.
          </div>
        )}

        {/* Current Collaborators List */}
        <div className="mt-6">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-3">
            People with Access ({shares.length + 1})
          </label>

          <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-zinc-50/50 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/40">
            {/* Owner Row */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <img
                  src={owner.avatar}
                  alt={owner.name}
                  className="h-8 w-8 rounded-full bg-zinc-200 object-cover"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {owner.name}
                    </span>
                    {owner.id === currentUser.id && (
                      <span className="text-[10px] text-zinc-400">(You)</span>
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {owner.email}
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-300">
                <Crown className="h-3 w-3" />
                Owner
              </span>
            </div>

            {/* Shared Users */}
            {shares.map((share) => (
              <div key={share.id} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <img
                    src={share.user.avatar}
                    alt={share.user.name}
                    className="h-8 w-8 rounded-full bg-zinc-200 object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {share.user.name}
                      </span>
                      {share.user.id === currentUser.id && (
                        <span className="text-[10px] text-zinc-400">(You)</span>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {share.user.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isOwner ? (
                    <>
                      <select
                        value={share.permission}
                        onChange={(e) =>
                          handleAddOrUpdateShare(
                            share.user.id,
                            e.target.value as "EDITOR" | "VIEWER"
                          )
                        }
                        className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        <option value="EDITOR">Editor</option>
                        <option value="VIEWER">Viewer</option>
                      </select>
                      <button
                        onClick={() => handleRevokeShare(share.user.id)}
                        className="p-1 text-zinc-400 hover:text-red-600 transition-colors"
                        title="Revoke access"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium ${
                        share.permission === "EDITOR"
                          ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-950/50 dark:text-blue-300"
                          : "bg-zinc-100 text-zinc-700 ring-1 ring-inset ring-zinc-500/10 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {share.permission === "EDITOR" ? (
                        <Edit3 className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                      {share.permission === "EDITOR" ? "Editor" : "Viewer"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Close footer */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
