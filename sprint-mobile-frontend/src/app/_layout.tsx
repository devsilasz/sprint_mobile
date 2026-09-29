import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider, AuthContext } from '../contexts/AuthContext';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = React.useContext(AuthContext)!;
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!isAuthenticated && !inAuthGroup) {
      
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isLoading, router]);

  if (isLoading) {
    return <LoadingScreen message="Iniciando Inteligência Competitiva..." />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="result" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
