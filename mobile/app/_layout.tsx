import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { registerForPushNotifications, savePushToken } from "@/lib/notifications";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
      SplashScreen.hideAsync();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      registerForPushNotifications().then(token => {
        if (token) savePushToken(token);
      });
    }
  }, [session]);

  if (!initialized) return null;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="package/[id]" options={{ headerShown: true, title: "Détail du colis", headerTintColor: "#1e3a5f" }} />
        <Stack.Screen name="submit" options={{ headerShown: true, title: "Soumettre un colis", headerTintColor: "#1e3a5f" }} />
        <Stack.Screen name="track" options={{ headerShown: true, title: "Suivi", headerTintColor: "#1e3a5f" }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
