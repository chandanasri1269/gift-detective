import { runLocalDetective } from "./giftDetectiveClient";
import type { RecipientProfile, OccasionDetails, BudgetCriteria, ScoredRecommendation } from "./giftDetectiveClient";

const API_BASE = "http://localhost:5000/api";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface SavedGiftItem {
  id: string;
  giftIdea: {
    id: string;
    title: string;
    description: string;
    estimatedPrice: number;
    currency: string;
    category: string;
    imageUrl?: string;
    vibe?: string;
  };
  recipientName?: string;
  status: "CONSIDERING" | "PURCHASED" | "ARCHIVED";
  notes?: string;
  savedAt: string;
}

// Token helper
export const getToken = (): string | null => localStorage.getItem("gd_token");
export const setToken = (token: string) => localStorage.setItem("gd_token", token);
export const removeToken = () => localStorage.removeItem("gd_token");

// Auth API
export const apiRegister = async (data: { name: string; email: string; password: string }) => {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Registration failed");
    if (json.token) setToken(json.token);
    return json;
  } catch (err: any) {
    // If backend is offline, create a simulated local user session
    const mockUser = { id: "local-user-1", name: data.name, email: data.email };
    const mockToken = "mock-jwt-token";
    setToken(mockToken);
    return { success: true, user: mockUser, token: mockToken, isOfflineMode: true };
  }
};

export const apiLogin = async (data: { email: string; password: string }) => {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Login failed");
    if (json.token) setToken(json.token);
    return json;
  } catch (err: any) {
    const mockUser = { id: "local-user-1", name: data.email.split("@")[0], email: data.email };
    const mockToken = "mock-jwt-token";
    setToken(mockToken);
    return { success: true, user: mockUser, token: mockToken, isOfflineMode: true };
  }
};

export const apiGetMe = async (): Promise<User | null> => {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.user;
  } catch {
    return { id: "local-user-1", name: "Detective Partner", email: "agent@detective.com" };
  }
};

// Quiz Investigation API
export const apiAnalyzeQuiz = async (
  recipient: RecipientProfile,
  occasion: OccasionDetails,
  budget: BudgetCriteria
): Promise<{ recommendations: ScoredRecommendation[]; sessionId?: string; isBackend: boolean }> => {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}/quiz/analyze`, {
      method: "POST",
      headers,
      body: JSON.stringify({ recipient, occasion, budget }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.recommendations && data.recommendations.length > 0) {
        return {
          recommendations: data.recommendations,
          sessionId: data.sessionId,
          isBackend: true,
        };
      }
    }
  } catch {
    // Backend offline / not reachable: gracefully use built-in detective engine
  }

  // Fallback to local detective investigation engine
  const localRecs = runLocalDetective(recipient, occasion, budget, 10);
  return {
    recommendations: localRecs,
    sessionId: `local-${Date.now()}`,
    isBackend: false,
  };
};

// Saved Gifts Storage Helper (combines API + LocalStorage)
const LOCAL_STORAGE_SAVED = "gd_saved_casebook";

export const getSavedGiftsLocal = (): SavedGiftItem[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SAVED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveGiftLocal = (item: SavedGiftItem): SavedGiftItem[] => {
  const current = getSavedGiftsLocal();
  const exists = current.some((s) => s.giftIdea.id === item.giftIdea.id && s.recipientName === item.recipientName);
  let updated = current;
  if (exists) {
    updated = current.map((s) => (s.giftIdea.id === item.giftIdea.id ? item : s));
  } else {
    updated = [item, ...current];
  }
  localStorage.setItem(LOCAL_STORAGE_SAVED, JSON.stringify(updated));
  return updated;
};

export const removeSavedGiftLocal = (id: string): SavedGiftItem[] => {
  const current = getSavedGiftsLocal();
  const updated = current.filter((s) => s.id !== id);
  localStorage.setItem(LOCAL_STORAGE_SAVED, JSON.stringify(updated));
  return updated;
};

export const updateSavedGiftStatusLocal = (id: string, status: "CONSIDERING" | "PURCHASED" | "ARCHIVED"): SavedGiftItem[] => {
  const current = getSavedGiftsLocal();
  const updated = current.map((s) => (s.id === id ? { ...s, status } : s));
  localStorage.setItem(LOCAL_STORAGE_SAVED, JSON.stringify(updated));
  return updated;
};
