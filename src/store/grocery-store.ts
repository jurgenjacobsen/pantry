import { create } from "zustand";

export type GroceryCategory = "Produce" | "Dairy" | "Bakery" | "Pantry" | "Snacks";
export type GroceryPriority = "low" | "medium" | "high";

export type GroceryItem = {
  id: string;
  name: string;
  category: GroceryCategory;
  quantity: number;
  purchased: boolean;
  priority: GroceryPriority;
};

export type CreateItemInput = {
  name: string;
  category: GroceryCategory;
  quantity: number;
  priority: GroceryPriority;
};

type ItemsResponse = { items: GroceryItem[] };
type ItemResponse = { item: GroceryItem };

type GroceryStore = {
  items: GroceryItem[];
  isLoading: boolean;
  error: string | null;
  loadItems: (userId: string | null | undefined) => Promise<void>;
  addItem: (userId: string | null | undefined, input: CreateItemInput) => Promise<GroceryItem | void>;
  updateQuantity: (userId: string | null | undefined, id: string, quantity: number) => Promise<void>;
  togglePurchased: (userId: string | null | undefined, id: string) => Promise<void>;
  removeItem: (userId: string | null | undefined, id: string) => Promise<void>;
  clearPurchased: (userId: string | null | undefined) => Promise<void>;
};

const getHeaders = (userId: string | null | undefined) => ({
  "Content-Type": "application/json",
  ...(userId ? { "x-user-id": userId } : {}),
});

export const useGroceryStore = create<GroceryStore>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  loadItems: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/items", {
        headers: getHeaders(userId),
      });
      const payload = (await res.json()) as ItemsResponse;

      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      set({ items: payload.items });
    } catch (error) {
      console.error("Error loading items:", error);
      set({ error: "Something went wrong" });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (userId, input) => {
    set({ error: null });
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: getHeaders(userId),
        body: JSON.stringify({
          name: input.name,
          category: input.category,
          quantity: Math.max(1, input.quantity),
          priority: input.priority,
        }),
      });
      const payload = (await res.json()) as ItemResponse;
      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      set((state) => ({ items: [payload.item, ...state.items] }));
      return payload.item;
    } catch (error) {
      console.error("Error adding item:", error);
      set({ error: "Something went wrong" });
    }
  },
  updateQuantity: async (userId, id, quantity) => {
    const nextQuantity = Math.max(1, quantity);
    set({ error: null });

    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: getHeaders(userId),
        body: JSON.stringify({ quantity: nextQuantity }),
      });
      const payload = (await res.json()) as ItemResponse;
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? payload.item : item)),
      }));
    } catch (error) {
      console.error("Error updating quantity:", error);
      set({ error: "Something went wrong" });
    }
  },

  togglePurchased: async (userId, id) => {
    const currentItem = get().items.find((item) => item.id === id);
    if (!currentItem) return;

    const nextPurchased = !currentItem.purchased;
    set({ error: null });
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: getHeaders(userId),
        body: JSON.stringify({ purchased: nextPurchased }),
      });

      const payload = (await res.json()) as ItemResponse;
      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      set((state) => ({
        items: state.items.map((item) => (item.id === id ? payload.item : item)),
      }));
    } catch (error) {
      console.error("Error toggling purchased:", error);
      set({ error: "Something went wrong" });
    }
  },

  removeItem: async (userId, id) => {
    set({ error: null });
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "DELETE",
        headers: getHeaders(userId),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
    } catch (error) {
      console.error("Error removing item:", error);
      set({ error: "Something went wrong" });
    }
  },

  clearPurchased: async (userId) => {
    set({ error: null });
    try {
      const res = await fetch("/api/items/clear-purchased", {
        method: "POST",
        headers: getHeaders(userId),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      const items = get().items.filter((item) => !item.purchased);
      set({ items });
    } catch (error) {
      console.error("Error clearing purchased:", error);
      set({ error: "Something went wrong" });
    }
  },
}));