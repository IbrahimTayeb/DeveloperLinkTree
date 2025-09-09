import { queryClient } from "./queryClient";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  username: string;
  bio: string;
  avatar: string;
  theme: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function getStoredAuth(): AuthState {
  const token = localStorage.getItem(TOKEN_KEY);
  const userStr = localStorage.getItem(USER_KEY);
  
  if (!token || !userStr) {
    return { user: null, token: null, isAuthenticated: false };
  }

  try {
    const user = JSON.parse(userStr);
    return { user, token, isAuthenticated: true };
  } catch {
    return { user: null, token: null, isAuthenticated: false };
  }
}

export function setStoredAuth(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAuthHeaders(): Record<string, string> {
  const { token } = getStoredAuth();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function logout(): void {
  clearStoredAuth();
  queryClient.clear();
  window.location.href = '/';
}
