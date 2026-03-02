import { create } from "zustand";

interface Account {
  email: string;
  password: string;
}

const STORAGE_KEY = "admin_accounts";

function loadAccounts(): Account[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveAccounts(accounts: Account[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

// Simulated reset codes: email → code (in-memory only)
const pendingResets = new Map<string, string>();

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

interface AdminAuthStore {
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  signup: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  sendResetCode: (email: string) => {
    ok: boolean;
    code?: string;
    error?: string;
  };
  verifyResetCode: (email: string, code: string) => boolean;
  resetPassword: (email: string, newPassword: string) => boolean;
}

export const useAdminAuthStore = create<AdminAuthStore>(() => ({
  isAuthenticated: sessionStorage.getItem("admin_auth") === "1",

  login: (email, password) => {
    const accounts = loadAccounts();
    const match = accounts.find(
      (a) => a.email === email && a.password === password,
    );
    if (match) {
      sessionStorage.setItem("admin_auth", "1");
      useAdminAuthStore.setState({ isAuthenticated: true });
      return true;
    }
    return false;
  },

  signup: (email, password) => {
    const accounts = loadAccounts();
    if (accounts.find((a) => a.email === email)) {
      return { ok: false, error: "An account with this email already exists" };
    }
    saveAccounts([...accounts, { email, password }]);
    return { ok: true };
  },

  logout: () => {
    sessionStorage.removeItem("admin_auth");
    useAdminAuthStore.setState({ isAuthenticated: false });
  },

  sendResetCode: (email) => {
    const accounts = loadAccounts();
    if (!accounts.find((a) => a.email === email)) {
      return { ok: false, error: "No account found with this email" };
    }
    const code = generateCode();
    pendingResets.set(email, code);
    // In production this would send an email — for now log to console
    console.info(`[Admin reset code for ${email}]: ${code}`);
    return { ok: true, code };
  },

  verifyResetCode: (email, code) => {
    return pendingResets.get(email) === code;
  },

  resetPassword: (email, newPassword) => {
    const accounts = loadAccounts();
    const idx = accounts.findIndex((a) => a.email === email);
    if (idx === -1) return false;
    accounts[idx].password = newPassword;
    saveAccounts(accounts);
    pendingResets.delete(email);
    return true;
  },
}));
