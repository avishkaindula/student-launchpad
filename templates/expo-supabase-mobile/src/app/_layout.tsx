import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { AuthProvider, useAuth } from '@/context/auth';

// Keep the splash screen up until we know whether the user is signed in.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hide();
    }
  }, [isLoading]);

  // Wait (behind the splash screen) until the saved session has loaded. Otherwise a
  // signed-in user would briefly be treated as signed out and lose the page they opened.
  if (isLoading) return null;

  // Stack.Protected hides screens when `guard` is false. When the user signs in or out,
  // Expo Router moves them to the first screen they are allowed to see.
  return (
    <Stack screenOptions={{ headerBackTitle: 'Back' }}>
      {/* Signed in only: the tabs in src/app/(app) */}
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack.Protected>

      {/* Signed out only */}
      <Stack.Protected guard={!session}>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up" options={{ title: 'Create account' }} />
        <Stack.Screen name="forgot-password" options={{ title: 'Forgot password' }} />
      </Stack.Protected>

      {/* Always available: opened from the password reset email, or from the Profile tab. */}
      <Stack.Screen name="reset-password" options={{ title: 'New password' }} />
    </Stack>
  );
}
