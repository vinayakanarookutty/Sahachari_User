import { useTranslation } from "react-i18next";

export function useAppFonts() {
  const { i18n } = useTranslation();
  const isMl = i18n.language === 'ml';

  return {
    isMl,
    fontRegular: isMl ? "NotoSansMalayalam_400Regular" : "Outfit_400Regular",
    fontMedium: isMl ? "NotoSansMalayalam_400Regular" : "Outfit_600SemiBold",
    fontBold: isMl ? "NotoSansMalayalam_700Bold" : "Outfit_700Bold",
    // Tailwind class helpers
    classRegular: isMl ? "font-malayalam" : "font-outfit",
    classMedium: isMl ? "font-malayalam" : "font-outfit-medium",
    classBold: isMl ? "font-malayalam-bold" : "font-outfit-bold",
    
    // Style helper for direct font family assignment
    styleRegular: { fontFamily: isMl ? "NotoSansMalayalam_400Regular" : "Outfit_400Regular" },
    styleMedium: { fontFamily: isMl ? "NotoSansMalayalam_400Regular" : "Outfit_600SemiBold" },
    styleBold: { fontFamily: isMl ? "NotoSansMalayalam_700Bold" : "Outfit_700Bold" },
  };
}
