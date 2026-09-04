"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SEEDED_USERS } from "@/lib/auth";

export type SeededUser = (typeof SEEDED_USERS)[0];

interface UserContextType {
  currentUser: SeededUser;
  switchUser: (userId: string) => void;
  allUsers: SeededUser[];
}

const UserContext = createContext<UserContextType>({
  currentUser: SEEDED_USERS[0],
  switchUser: () => {},
  allUsers: SEEDED_USERS,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<SeededUser>(SEEDED_USERS[0]);

  useEffect(() => {
    const savedUserId = localStorage.getItem("ajai_active_user");
    if (savedUserId) {
      const match = SEEDED_USERS.find((u) => u.id === savedUserId);
      if (match) {
        setCurrentUser(match);
      }
    }
  }, []);

  const switchUser = (userId: string) => {
    const target = SEEDED_USERS.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem("ajai_active_user", target.id);
      // Also update cookie for SSR
      document.cookie = `ajai_user_id=${target.id}; path=/; max-age=31536000`;
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, switchUser, allUsers: SEEDED_USERS }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
