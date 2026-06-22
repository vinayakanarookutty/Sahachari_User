import { QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../../global.css';
import { queryClient } from '../lib/queryClient';
import { useAuthStore } from '../store/auth.store';
import { initializeLanguage } from "../i18n";

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);

  const hydrated = useAuthStore((s) => s.hydrated);
  const [languageReady, setLanguageReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await hydrate();
      await initializeLanguage();
      setLanguageReady(true);
    };

    init();
  }, []);

  if (!hydrated || !languageReady) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
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
