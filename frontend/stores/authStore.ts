import { dev } from "@/utils/dev";
import {
  deleteSecureStore,
  getSecureStore,
  saveSecureStore,
} from "@/utils/secureStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { router } from "expo-router";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useUserStore } from "./userStore";
import { CountryCode, DEFAULT_LANGUAGE } from "@/constants/i18n";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  countryCode: string | null;
  isHydrated: boolean;

  // Actions
  login: (
    accessToken: string,
    refreshToken: string,
    countryCode: string,
  ) => Promise<void>;
  logout: (redirectTo?: string) => Promise<void>;
  updateAccessToken: (accessToken: string) => Promise<void>;
  restoreTokens: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      countryCode: null,
      isHydrated: false,

      //login action
      login: async (accessToken, refreshToken, countryCode) => {
        // 토큰은 SecureStore에 별도 저장
        await saveSecureStore("accessToken", accessToken);
        await saveSecureStore("refreshToken", refreshToken);

        // 언어는 AsyncStorage에 저장
        useUserStore
          .getState()
          .setLanguage((countryCode as CountryCode) ?? DEFAULT_LANGUAGE);

        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
          countryCode,
          isHydrated: true,
        });
      },

      //logout action
      logout: async (redirectTo?: string) => {
        // SecureStore에서 토큰 제거
        await deleteSecureStore("accessToken");
        await deleteSecureStore("refreshToken");

        // Google 로그아웃
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();

        // 언어설정 초기화
        useUserStore.getState().resetUser();

        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          countryCode: null,
          isHydrated: true,
        });

        if (redirectTo) {
          router.replace(redirectTo);
        }
      },

      //updateAccessToken action
      updateAccessToken: async (accessToken: string) => {
        await saveSecureStore("accessToken", accessToken);
        set({ accessToken });
      },

      // SecureStore에서 토큰 복원
      restoreTokens: async () => {
        try {
          const accessToken = await getSecureStore("accessToken");
          const refreshToken = await getSecureStore("refreshToken");

          if (accessToken && refreshToken) {
            set({
              accessToken,
              refreshToken,
              isAuthenticated: true,
            });
          }
        } catch (error) {
          dev.error("토큰 복원 실패:", error);
        }
      },
    }),

    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // 토큰은 SecureStore에 저장하므로 persist에서 제외
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        countryCode: state.countryCode,
        isHydrated: state.isHydrated,
      }),
    },
  ),
);
