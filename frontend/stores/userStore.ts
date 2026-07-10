import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { changeLanguage } from "i18next";
import { dev } from "@/utils/dev";
import { CountryCode, DEFAULT_LANGUAGE } from "@/constants/i18n";

interface UserState {
  language: CountryCode;
  isHydrated: boolean;

  // Actions
  setLanguage: (language: CountryCode) => void;
  resetUser: () => void;
  _setHydrated: (hydrated: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE, // 첫 사용자는 한국어
      isHydrated: false,
      _setHydrated: (isHydrated) => set({ isHydrated }),

      // 언어 설정
      setLanguage: (language) => {
        set({ language });
        changeLanguage(language).catch(dev.error);
      },

      // 사용자 정보 초기화 (로그아웃 시)
      resetUser: () => {
        set({ language: DEFAULT_LANGUAGE });
        changeLanguage(DEFAULT_LANGUAGE).catch(dev.error);
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),

      // Hydration 완료 시 콜백 (i18n은 이미 _layout.tsx에서 초기화됨)
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._setHydrated(true);
        }
      },
    },
  ),
);
