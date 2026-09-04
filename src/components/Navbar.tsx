"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import {
  FileText,
  UserCheck,
  ChevronDown,
} from "lucide-react";

interface NavbarProps {
  isEditorPage?: boolean;
}

export function Navbar({ isEditorPage }: NavbarProps) {
  const { currentUser, switchUser, allUsers } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Ajaia Docs
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Right: User Switcher */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* User Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 py-1 pl-1 pr-2.5 text-left text-xs hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-all focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              title="Switch user account for evaluation"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-7 w-7 rounded-full bg-indigo-100 object-cover ring-1 ring-zinc-300 dark:ring-zinc-700"
              />
              <div className="hidden md:flex flex-col">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  {currentUser.roleTitle}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2 py-1.5 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                    <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                      Switch Active User
                    </p>
                  </div>
                  {allUsers.map((user) => {
                    const isSelected = user.id === currentUser.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => {
                          switchUser(user.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors ${
                          isSelected
                            ? "bg-indigo-50 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200"
                            : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-8 w-8 rounded-full bg-zinc-200 object-cover"
                          />
                          <div>
                            <div className="text-xs font-semibold">{user.name}</div>
                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                              {user.roleTitle}
                            </div>
                          </div>
                        </div>
                        {isSelected && <UserCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
