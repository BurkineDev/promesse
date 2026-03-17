import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { Package, STATUS_LABELS, STATUS_COLORS } from "@/lib/types";

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [recentPackages, setRecentPackages] = useState<Package[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();
    if (profile) setUserName(profile.name);

    const { data: pkgs } = await supabase
      .from("packages")
      .select("id, tracking_number, status, destination, origin, created_at, description, weight, category, estimated_price, is_urgent, qr_code_url, photo_url")
      .eq("submitted_by", user.id)
      .order("created_at", { ascending: false })
      .limit(3);
    setRecentPackages(pkgs ?? []);
  }

  useEffect(() => { loadData(); }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  const firstName = userName.split(" ")[0];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1e3a5f" />}
    >
      {/* Greeting */}
      <View style={styles.greeting}>
        <Text style={styles.greetingHello}>Bonjour{firstName ? `, ${firstName}` : ""} 👋</Text>
        <Text style={styles.greetingSub}>Que souhaitez-vous faire ?</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionCard, styles.actionPrimary]} onPress={() => router.push("/submit")}>
          <Ionicons name="add-circle" size={32} color="#fff" />
          <Text style={styles.actionPrimaryLabel}>Soumettre un colis</Text>
          <Text style={styles.actionPrimaryDesc}>Canada → Burkina Faso</Text>
        </TouchableOpacity>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionSecondary} onPress={() => router.push("/(tabs)/mes-colis")}>
            <Ionicons name="cube-outline" size={24} color="#1e3a5f" />
            <Text style={styles.actionSecondaryLabel}>Mes colis</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionSecondary} onPress={() => router.push("/track")}>
            <Ionicons name="search-outline" size={24} color="#1e3a5f" />
            <Text style={styles.actionSecondaryLabel}>Suivre</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionSecondary}
            onPress={() => Linking.openURL("https://wa.me/15141234567?text=Bonjour%20La%20Promesse")}
          >
            <Ionicons name="logo-whatsapp" size={24} color="#16a34a" />
            <Text style={styles.actionSecondaryLabel}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent packages */}
      {recentPackages.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Colis récents</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/mes-colis")}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          {recentPackages.map(pkg => (
            <TouchableOpacity
              key={pkg.id}
              style={styles.packageCard}
              onPress={() => router.push(`/package/${pkg.id}`)}
            >
              <View style={styles.packageLeft}>
                <Text style={styles.trackingNumber}>{pkg.tracking_number}</Text>
                <Text style={styles.packageDest}>{pkg.destination}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: STATUS_COLORS[pkg.status].bg },
              ]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[pkg.status].text }]}>
                  {STATUS_LABELS[pkg.status]}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Info block */}
      <View style={styles.infoBlock}>
        <Ionicons name="information-circle-outline" size={20} color="#1e3a5f" />
        <Text style={styles.infoText}>
          Livraison Canada → Burkina Faso par voie aérienne et maritime.
          Délais habituels : 7–14 jours (air), 30–45 jours (mer).
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, paddingBottom: 32 },
  greeting: { marginBottom: 20 },
  greetingHello: { fontSize: 24, fontWeight: "800", color: "#111827" },
  greetingSub: { fontSize: 14, color: "#6b7280", marginTop: 2 },
  actions: { marginBottom: 24, gap: 12 },
  actionCard: { borderRadius: 16, padding: 20 },
  actionPrimary: { backgroundColor: "#1e3a5f" },
  actionPrimaryLabel: { color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 8 },
  actionPrimaryDesc: { color: "#93c5fd", fontSize: 13, marginTop: 2 },
  actionsRow: { flexDirection: "row", gap: 10 },
  actionSecondary: {
    flex: 1, backgroundColor: "#fff", borderRadius: 14, padding: 16,
    alignItems: "center", gap: 6,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  actionSecondaryLabel: { fontSize: 12, fontWeight: "600", color: "#374151" },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  seeAll: { fontSize: 13, color: "#1e3a5f", fontWeight: "600" },
  packageCard: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 8,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  packageLeft: { flex: 1 },
  trackingNumber: { fontSize: 13, fontWeight: "700", fontFamily: "monospace", color: "#111827" },
  packageDest: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "600" },
  infoBlock: {
    backgroundColor: "#eff6ff", borderRadius: 12, padding: 14,
    flexDirection: "row", gap: 10, alignItems: "flex-start",
  },
  infoText: { flex: 1, fontSize: 12, color: "#1e40af", lineHeight: 18 },
});
