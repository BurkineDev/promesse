import { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { Package, PackageStatus, STATUS_LABELS, STATUS_COLORS } from "@/lib/types";

const FILTERS: { label: string; value: PackageStatus | "TOUS" }[] = [
  { label: "Tous", value: "TOUS" },
  { label: "En cours", value: "EXPEDIE" },
  { label: "Livrés", value: "LIVRE" },
  { label: "Incidents", value: "INCIDENT" },
];

export default function MesColisScreen() {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [filter, setFilter] = useState<PackageStatus | "TOUS">("TOUS");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadPackages() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from("packages")
      .select("id, tracking_number, status, destination, origin, created_at, description, weight, category, estimated_price, is_urgent, qr_code_url, photo_url")
      .eq("submitted_by", user.id)
      .order("created_at", { ascending: false });

    const { data } = await query;
    setPackages(data ?? []);
    setLoading(false);
  }

  useEffect(() => { loadPackages(); }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadPackages();
    setRefreshing(false);
  }

  const displayed = filter === "TOUS"
    ? packages
    : packages.filter(p => {
        if (filter === "EXPEDIE") return ["EXPEDIE","EN_TRANSIT","EN_COURS_LIVRAISON","ARRIVE"].includes(p.status);
        return p.status === filter;
      });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1e3a5f" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter tabs */}
      <View style={styles.filters}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterTab, filter === f.value && styles.filterTabActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={displayed}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1e3a5f" />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>Aucun colis trouvé</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push("/submit")}>
              <Text style={styles.emptyBtnText}>Soumettre un colis</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/package/${item.id}`)}
          >
            <View style={styles.cardTop}>
              <Text style={styles.trackingNum}>{item.tracking_number}</Text>
              <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status].bg }]}>
                <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status].text }]}>
                  {STATUS_LABELS[item.status]}
                </Text>
              </View>
            </View>
            <View style={styles.cardMeta}>
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={12} color="#9ca3af" />
                <Text style={styles.metaText}>{item.destination}</Text>
              </View>
              {item.is_urgent && (
                <View style={styles.urgentBadge}>
                  <Text style={styles.urgentText}>URGENT</Text>
                </View>
              )}
            </View>
            {item.estimated_price && (
              <Text style={styles.price}>
                Estimation : {new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(item.estimated_price)}
              </Text>
            )}
          </TouchableOpacity>
        )}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push("/submit")}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  filters: { flexDirection: "row", backgroundColor: "#fff", paddingHorizontal: 16, paddingVertical: 10, gap: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  filterTab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "#f1f5f9" },
  filterTabActive: { backgroundColor: "#1e3a5f" },
  filterText: { fontSize: 13, fontWeight: "600", color: "#6b7280" },
  filterTextActive: { color: "#fff" },
  list: { padding: 16, paddingBottom: 80 },
  card: {
    backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  trackingNum: { fontSize: 13, fontWeight: "700", fontFamily: "monospace", color: "#111827" },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "600" },
  cardMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: "#6b7280" },
  urgentBadge: { backgroundColor: "#fff7ed", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  urgentText: { fontSize: 10, fontWeight: "700", color: "#ea580c" },
  price: { fontSize: 12, color: "#1e40af", fontWeight: "600", marginTop: 6 },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyText: { color: "#9ca3af", marginTop: 12, fontSize: 15 },
  emptyBtn: { marginTop: 16, backgroundColor: "#1e3a5f", borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  emptyBtnText: { color: "#fff", fontWeight: "700" },
  fab: {
    position: "absolute", bottom: 24, right: 24,
    backgroundColor: "#1e3a5f", width: 56, height: 56, borderRadius: 28,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 8,
  },
});
