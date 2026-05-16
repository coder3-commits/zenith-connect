// Sync, framework-free token store used by the axios interceptor.
// Kept separate from Zustand to avoid React imports inside axios setup.

const TOKEN_KEY = "zentrix.token";

let memoryToken: string | null = null;

export const tokenStore = {
  get(): string | null {
    if (memoryToken) return memoryToken;
    if (typeof window === "undefined") return null;
    memoryToken = window.localStorage.getItem(TOKEN_KEY);
    return memoryToken;
  },
  set(token: string | null) {
    memoryToken = token;
    if (typeof window === "undefined") return;
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  },
};

export const TOKEN_STORAGE_KEY = TOKEN_KEY;
