import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "./locales/en.json";
import ml from "./locales/ml.json";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
    },
    ml: {
      translation: ml,
    },
  },


  lng: Localization.getLocales()[0]?.languageCode || "en",
  fallbackLng: "en",

  interpolation: {
    escapeValue: false,
  },
}); 

export const initializeLanguage = async () => {
  const savedLanguage = await AsyncStorage.getItem("language");

  if (savedLanguage) {
    await i18n.changeLanguage(savedLanguage);
  }
};

export default i18n;