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
    tags?: string[];
    detectiveClue?: string;
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
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (netErr: any) {
    // True network outage fallback only
    const mockUser = { id: "local-user-1", name: data.name, email: data.email };
    const mockToken = "mock-jwt-token";
    setToken(mockToken);
    return { success: true, user: mockUser, token: mockToken, isOfflineMode: true };
  }

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Registration failed");
  }

  if (json.token) setToken(json.token);
  return json;
};

export const apiLogin = async (data: { email: string; password: string }) => {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (netErr: any) {
    // True network outage fallback only
    const mockUser = { id: "local-user-1", name: data.email.split("@")[0], email: data.email };
    const mockToken = "mock-jwt-token";
    setToken(mockToken);
    return { success: true, user: mockUser, token: mockToken, isOfflineMode: true };
  }

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Login failed");
  }

  if (json.token) setToken(json.token);
  return json;
};

export const apiGetMe = async (): Promise<User | null> => {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      removeToken();
      return null;
    }
    const json = await res.json();
    return json.user;
  } catch {
    return null;
  }
};

// Gift Catalog API
export const apiGetGifts = async (params?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  limit?: number;
}) => {
  try {
    const query = new URLSearchParams();
    if (params?.category && params.category !== "all") query.set("category", params.category);
    if (params?.minPrice !== undefined) query.set("minPrice", params.minPrice.toString());
    if (params?.maxPrice !== undefined) query.set("maxPrice", params.maxPrice.toString());
    if (params?.search) query.set("search", params.search);
    query.set("limit", (params?.limit || 100).toString());

    const res = await fetch(`${API_BASE}/gifts?${query.toString()}`);
    if (res.ok) {
      const data = await res.json();
      return data.gifts;
    }
  } catch {
    // Return null to allow fallback to static gifts
  }
  return null;
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

// Local storage backup key
const LOCAL_STORAGE_SAVED = "gd_saved_casebook";

export const getSavedGiftsLocal = (): SavedGiftItem[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SAVED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setSavedGiftsLocal = (items: SavedGiftItem[]) => {
  localStorage.setItem(LOCAL_STORAGE_SAVED, JSON.stringify(items));
};

// Synchronized Casebook API + LocalStorage
export const apiGetSavedGifts = async (): Promise<SavedGiftItem[]> => {
  const token = getToken();
  if (token) {
    try {
      const res = await fetch(`${API_BASE}/saved-gifts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.savedGifts)) {
          const mapped: SavedGiftItem[] = data.savedGifts.map((sg: any) => ({
            id: sg.id,
            giftIdea: sg.giftIdea,
            recipientName: sg.recipient?.name || sg.customNotes || "Special Someone",
            status: sg.status || "CONSIDERING",
            notes: sg.customNotes,
            savedAt: sg.createdAt,
          }));
          setSavedGiftsLocal(mapped);
          return mapped;
        }
      }
    } catch {
      // Fall back to local
    }
  }
  return getSavedGiftsLocal();
};

export const apiSaveGift = async (item: SavedGiftItem): Promise<SavedGiftItem[]> => {
  const token = getToken();
  let backendSavedItem: any = null;

  if (token) {
    try {
      const res = await fetch(`${API_BASE}/saved-gifts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          giftIdeaId: item.giftIdea.id,
          status: item.status,
          customNotes: item.recipientName || item.notes,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.savedGift) {
          backendSavedItem = data.savedGift;
        }
      }
    } catch {
      // Keep local
    }
  }

  const current = getSavedGiftsLocal();
  const normalizedItem: SavedGiftItem = backendSavedItem
    ? {
        id: backendSavedItem.id,
        giftIdea: backendSavedItem.giftIdea,
        recipientName: item.recipientName,
        status: backendSavedItem.status,
        notes: backendSavedItem.customNotes,
        savedAt: backendSavedItem.createdAt,
      }
    : item;

  const exists = current.some((s) => s.giftIdea.id === normalizedItem.giftIdea.id);
  const updated = exists
    ? current.map((s) => (s.giftIdea.id === normalizedItem.giftIdea.id ? normalizedItem : s))
    : [normalizedItem, ...current];

  setSavedGiftsLocal(updated);
  return updated;
};

export const apiUpdateSavedGiftStatus = async (
  id: string,
  status: "CONSIDERING" | "PURCHASED" | "ARCHIVED"
): Promise<SavedGiftItem[]> => {
  const token = getToken();
  if (token && !id.startsWith("saved-")) {
    try {
      await fetch(`${API_BASE}/saved-gifts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
    } catch {
      // Keep local
    }
  }

  const current = getSavedGiftsLocal();
  const updated = current.map((s) => (s.id === id ? { ...s, status } : s));
  setSavedGiftsLocal(updated);
  return updated;
};

export const apiRemoveSavedGift = async (id: string): Promise<SavedGiftItem[]> => {
  const token = getToken();
  if (token && !id.startsWith("saved-")) {
    try {
      await fetch(`${API_BASE}/saved-gifts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Keep local
    }
  }

  const current = getSavedGiftsLocal();
  const updated = current.filter((s) => s.id !== id);
  setSavedGiftsLocal(updated);
  return updated;
};
