import { create } from "zustand";
import type { User } from "@/types/user";
import { tokenStore } from "./tokenStore";

const USER_KEY = "zentrix.user";

type AuthState = {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  isAuthenticated: boolean;
  hydrate: () => void;
  setSession: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
};

function readUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,
  isAuthenticated: false,
  hydrate: () => {
    const token = tokenStore.get();
    const user = readUser();
    set({
      token,
      user,
      hydrated: true,
      isAuthenticated: Boolean(token && user),
    });
  },
  setSession: (token, user) => {
    tokenStore.set(token);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    set({ token, user, isAuthenticated: true, hydrated: true });
  },
  setUser: (user) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    set({ user });
  },
  logout: () => {
    tokenStore.set(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(USER_KEY);
    }
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
