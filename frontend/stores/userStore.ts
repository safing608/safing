import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { changeLanguage } from "i18next";
import { dev } from "@/utils/dev";
import { CountryCode, DEFAULT_LANGUAGE } from "@/constants/i18n";

interface UserState {
  language: CountryCode;
  hasSetLanguage: boolean;
  setLanguage: (language: CountryCode) => void;
  isHydrated: boolean;
  _setHydrated: (hydrated: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE, // 첫 사용자는 한국어
      hasSetLanguage: false, // 첫 사용자는 언어 미설정 상태
      isHydrated: false,
      _setHydrated: (isHydrated) => set({ isHydrated }),

      setLanguage: (language) => {
        set({ language, hasSetLanguage: true });
        changeLanguage(language).catch(dev.error);
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
