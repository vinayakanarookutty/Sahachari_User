import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import '../../global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';
import "../i18n";
import { initializeLanguage } from "../i18n";

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);

  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    const init = async () => {
      await hydrate();
      await initializeLanguage();
    };

    init();
  }, []);

  if (!hydrated) {
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
