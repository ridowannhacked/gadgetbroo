// components/UserStoreHydrator.tsx
"use client";
import { useEffect } from "react";
import { useUserStore } from "../lib/stores/useUserStore";
import type { User } from "../lib/auth";  // ← import the real type

type Props = {
  user: User | null;  // ← use it here instead of the manual definition
};

export function UserStoreHydrator({ user }: Props) {
  const setUser = useUserStore((s) => s.setUser);
  useEffect(() => {
    setUser(user);
  }, [user, setUser]);
  return null;
}
