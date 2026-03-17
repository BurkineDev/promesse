import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace("/(auth)/login");
    });
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#1e3a5f",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: { borderTopColor: "#e5e7eb", paddingBottom: 4 },
        headerStyle: { backgroundColor: "#1e3a5f" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          headerTitle: "La Promesse",
        }}
      />
      <Tabs.Screen
        name="mes-colis"
        options={{
          title: "Mes colis",
          tabBarIcon: ({ color, size }) => <Ionicons name="cube" size={size} color={color} />,
          headerTitle: "Mes colis",
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, size }) => <Ionicons name="notifications" size={size} color={color} />,
          headerTitle: "Notifications",
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
          headerTitle: "Mon profil",
        }}
      />
    </Tabs>
  );
}
