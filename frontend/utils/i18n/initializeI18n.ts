import AsyncStorage from "@react-native-async-storage/async-storage";
import { use } from "i18next";
import { initReactI18next } from "react-i18next";
import { dev } from "../dev";
import { DEFAULT_LANGUAGE } from "@/constants/i18n";
import { USER_STORAGE_KEY } from "@/constants/storeKeys";

// 저장된 언어 확인하고 i18n 초기화
export const initializeI18n = (() => {
  let isInitialized = false;

  return async () => {
    if (isInitialized) return;

    // AsyncStorage에서 저장된 언어 확인
    let initialLanguage = DEFAULT_LANGUAGE;
    try {
      const stored = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        initialLanguage = JSON.parse(stored).state.language;
      }
    } catch {
      // AsyncStorage 오류 시 기본 언어 사용
    }

    dev.log("initialLanguage", initialLanguage);

    try {
      await use(initReactI18next).init({
        resources: {
          KR: { translation: require("@/utils/i18n/kr.json").translation },
          US: { translation: require("@/utils/i18n/us.json").translation },
          KH: { translation: require("@/utils/i18n/kh.json").translation },
          VN: { translation: require("@/utils/i18n/vn.json").translation },
          NP: { translation: require("@/utils/i18n/np.json").translation },
        },
        lng: initialLanguage, // 저장된 언어 또는 기본 한국어
        fallbackLng: "KR",
        interpolation: {
          escapeValue: false,
        },
      });

      isInitialized = true;
    } catch (error) {
      dev.error(error);
      throw error;
    }
  };
})();
