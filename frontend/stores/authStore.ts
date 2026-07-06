import { router } from "expo-router";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  countryCode: string | null;

  // Actions
  login: (accessToken: string, refreshToken: string, countryCode: string) => void;
  logout: (redirectTo?: string) => void;
  updateAccessToken: (accessToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      countryCode: null,
      //login action
      login: (accessToken, refreshToken, countryCode) =>
        set({ accessToken, refreshToken, isAuthenticated: true, countryCode }),

      //logout action
      logout: (redirectTo?: string) => {
        set({ accessToken: null, refreshToken: null, isAuthenticated: false, countryCode: null });
        if (redirectTo) {
          router.replace(redirectTo);
        }
      },

      //updateAccessToken action
      updateAccessToken: (accessToken: string) => set({ accessToken }),
    }),
    {
      name: "auth-storage",
    },
  ),
);
