import { Stack, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, Text } from 'react-native';
import { colors } from '@/constants/theme';
import { SubscriptionService } from '@/services/subscription';
import { i18n } from '@/services/i18n';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeApp = async () => {
    // Initialize i18n
    await i18n.init();
    await checkOnboarding();
    // Initialize RevenueCat
    await SubscriptionService.initialize();
  };

  const checkOnboarding = async () => {
    try {
      const completed = await AsyncStorage.getItem('@cryptoshield_onboarding_complete');
      setHasCompletedOnboarding(completed === 'true');
    } catch (error) {
      console.error('Error checking onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;

    const inOnboarding = segments[0] === 'onboarding';

    if (!hasCompletedOnboarding && !inOnboarding) {
      router.replace('/onboarding');
    } else if (hasCompletedOnboarding && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [hasCompletedOnboarding, segments, isLoading, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <View style={{ alignItems: 'center', gap: 20 }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: `${colors.primary}22`,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
          }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
          <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Загрузка Cryptoshield...</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
