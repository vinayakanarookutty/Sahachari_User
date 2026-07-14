import { QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../../global.css';
import { queryClient } from '../lib/queryClient';
import { useAuthStore } from '../store/auth.store';
import { initializeLanguage } from "../i18n";
import { useFonts } from 'expo-font';
import {
  Outfit_400Regular,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import {
  NotoSansMalayalam_400Regular,
  NotoSansMalayalam_700Bold,
} from '@expo-google-fonts/noto-sans-malayalam';

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [languageReady, setLanguageReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
    NotoSansMalayalam_400Regular,
    NotoSansMalayalam_700Bold,
  });

  useEffect(() => {
    const init = async () => {
      await hydrate();
      await initializeLanguage();
      setLanguageReady(true);
    };

    init();
  }, []);

  if (!hydrated || !languageReady || !fontsLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Slot />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
