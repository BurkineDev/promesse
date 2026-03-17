import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ScrollView, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";

interface Profile {
  name: string;
  email: string;
  phone: string | null;
  role: string;
}

export default function ProfilScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, livres: 0 });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: p } = await supabase
        .from("profiles")
        .select("name, email, phone, role")
        .eq("id", user.id)
        .single();
      if (p) setProfile(p);

      const { data: pkgs } = await supabase
        .from("packages")
        .select("status")
        .eq("submitted_by", user.id);
      if (pkgs) {
        setStats({
          total: pkgs.length,
          livres: pkgs.filter(p => p.status === "LIVRE").length,
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleLogout() {
    Alert.alert("Déconnexion", "Voulez-vous vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion", style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#1e3a5f" />
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.name?.charAt(0).toUpperCase() ?? "?"}
          </Text>
        </View>
        <Text style={styles.name}>{profile?.name}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
        {profile?.role === "client" && (
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Client</Text>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Colis soumis</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: "#16a34a" }]}>{stats.livres}</Text>
          <Text style={styles.statLabel}>Livrés</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations</Text>
        {[
          { icon: "person-outline", label: "Nom", value: profile?.name },
          { icon: "mail-outline", label: "Email", value: profile?.email },
          { icon: "call-outline", label: "Téléphone", value: profile?.phone ?? "Non renseigné" },
        ].map(item => (
          <View key={item.label} style={styles.infoRow}>
            <Ionicons name={item.icon as any} size={18} color="#6b7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/submit")}>
          <Ionicons name="cube-outline" size={20} color="#1e3a5f" />
          <Text style={styles.menuLabel}>Soumettre un colis</Text>
          <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/track")}>
          <Ionicons name="search-outline" size={20} color="#1e3a5f" />
          <Text style={styles.menuLabel}>Suivre un colis</Text>
          <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#dc2626" />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  avatarSection: { alignItems: "center", paddingVertical: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#1e3a5f", alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: "800", color: "#fff" },
  name: { fontSize: 20, fontWeight: "700", color: "#111827" },
  email: { fontSize: 14, color: "#6b7280", marginTop: 2 },
  roleBadge: { marginTop: 8, backgroundColor: "#eff6ff", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  roleText: { fontSize: 12, fontWeight: "600", color: "#1e40af" },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: "#fff", borderRadius: 14, padding: 16, alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  statValue: { fontSize: 28, fontWeight: "800", color: "#1e3a5f" },
  statLabel: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  section: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#6b7280", textTransform: "uppercase", marginBottom: 14, letterSpacing: 0.5 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: "#9ca3af" },
  infoValue: { fontSize: 14, color: "#111827", fontWeight: "500", marginTop: 1 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  menuLabel: { flex: 1, fontSize: 15, color: "#111827" },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#fff", borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: "#fecaca",
  },
  logoutText: { fontSize: 15, fontWeight: "600", color: "#dc2626" },
});
