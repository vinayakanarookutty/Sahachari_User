import { useTranslation } from "react-i18next";

export function useAppFonts() {
  const { i18n } = useTranslation();
  const isMl = i18n.language === 'ml';

  return {
    isMl,
    fontRegular: isMl ? "NotoSansMalayalam_400Regular" : "Montserrat_400Regular",
    fontMedium: isMl ? "NotoSansMalayalam_400Regular" : "Montserrat_600SemiBold",
    fontBold: isMl ? "NotoSansMalayalam_700Bold" : "PlayfairDisplay_700Bold",
    // Tailwind class helpers
    classRegular: isMl ? "font-malayalam" : "font-montserrat",
    classMedium: isMl ? "font-malayalam" : "font-montserrat-medium",
    classBold: isMl ? "font-malayalam-bold" : "font-playfair",
    
    // Style helper for direct font family assignment
    styleRegular: { fontFamily: isMl ? "NotoSansMalayalam_400Regular" : "Montserrat_400Regular" },
    styleMedium: { fontFamily: isMl ? "NotoSansMalayalam_400Regular" : "Montserrat_600SemiBold" },
    styleBold: { fontFamily: isMl ? "NotoSansMalayalam_700Bold" : "PlayfairDisplay_700Bold" },
  };
}
