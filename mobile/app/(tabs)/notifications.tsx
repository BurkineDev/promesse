import { useEffect, useState } from "react";
import {
  View, Text, FlatList, StyleSheet,
  RefreshControl, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";

interface Notif {
  id: string;
  tracking_number: string;
  status: string;
  notes: string | null;
  created_at: string;
}

export default function NotificationsScreen() {
  const [events, setEvents] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadEvents() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("tracking_events")
      .select("id, status, notes, created_at, package:packages!inner(tracking_number, submitted_by)")
      .eq("package.submitted_by", user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    const formatted: Notif[] = (data ?? []).map((e: any) => ({
      id: e.id,
      tracking_number: e.package?.tracking_number ?? "—",
      status: e.status,
      notes: e.notes,
      created_at: e.created_at,
    }));
    setEvents(formatted);
    setLoading(false);
  }

  useEffect(() => { loadEvents(); }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("fr-CA", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    });
  }

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#1e3a5f" />
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={events}
      keyExtractor={item => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1e3a5f" />}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="notifications-outline" size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>Aucune notification</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.item}>
          <View style={styles.dot} />
          <View style={styles.itemContent}>
            <Text style={styles.itemTrack}>{item.tracking_number}</Text>
            <Text style={styles.itemStatus}>{item.status}</Text>
            {item.notes && <Text style={styles.itemNotes}>{item.notes}</Text>}
            <Text style={styles.itemDate}>{formatDate(item.created_at)}</Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 16, paddingBottom: 32 },
  item: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 8,
    flexDirection: "row", gap: 12, alignItems: "flex-start",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#1e3a5f", marginTop: 5 },
  itemContent: { flex: 1 },
  itemTrack: { fontSize: 12, fontFamily: "monospace", fontWeight: "700", color: "#6b7280" },
  itemStatus: { fontSize: 14, fontWeight: "700", color: "#111827", marginTop: 1 },
  itemNotes: { fontSize: 13, color: "#4b5563", marginTop: 3 },
  itemDate: { fontSize: 11, color: "#9ca3af", marginTop: 5 },
  empty: { alignItems: "center", paddingTop: 80 },
  emptyText: { color: "#9ca3af", marginTop: 12, fontSize: 15 },
});
