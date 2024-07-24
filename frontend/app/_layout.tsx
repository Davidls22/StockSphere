import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { Stack, Slot } from 'expo-router';
import { UserProvider } from '../contexts/AuthContext';
import { StockProvider } from '../contexts/StockContext';
import Toast from 'react-native-toast-message';
import Onboarding from '../components/Onboarding'

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    ...FontAwesome.font,
  });

  const [isSplashReady, setSplashReady] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (fontsLoaded) {
        setSplashReady(true);
        SplashScreen.hideAsync();
      }
    }, 2000);

    if (fontsLoaded) {
      clearTimeout(timeout);
      setSplashReady(true);
      SplashScreen.hideAsync();
    }

    return () => clearTimeout(timeout);
  }, [fontsLoaded]);

  if (!isSplashReady) {
    return null;
  }

  const handleOnboardingFinish = () => {
    setIsOnboardingComplete(true);
  };

  if (!isOnboardingComplete) {
    return <Onboarding onFinish={handleOnboardingFinish} />;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <UserProvider>
      <StockProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="(public)/login"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="(public)/register"
            options={{ headerShown: false }}
          />
        </Stack>
        <Toast />
      </StockProvider>
    </UserProvider>
  );
}
