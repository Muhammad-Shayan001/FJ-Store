import { create } from "zustand";
import { User } from "@supabase/supabase-js";
import { createClient } from "../supabase/client";

interface AuthState {
  user: User | null;
  profile: any | null; // Replace any with Profile type later
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: any | null) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  initialize: async () => {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        set({ user: session.user });
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (profile) set({ profile });
      }
    } catch (error) {
      console.error("Auth init error", error);
      set({ user: null, profile: null });
    } finally {
      set({ isLoading: false });
    }
  },
  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },
}));
