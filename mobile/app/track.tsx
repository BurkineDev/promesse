import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { TrackingEvent, STATUS_LABELS, STATUS_COLORS, PackageStatus } from "@/lib/types";

interface TrackResult {
  id: string;
  tracking_number: string;
  status: PackageStatus;
  destination: string;
  origin: string;
  description: string | null;
}

export default function TrackScreen() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [notFound, setNotFound] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setNotFound(false);
    setResult(null);
    setEvents([]);

    const { data: pkg } = await supabase
      .rpc("get_package_by_tracking", { p_tracking: query.trim().toUpperCase() });

    if (!pkg || pkg.length === 0) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const p = pkg[0];
    setResult({
      id: p.id,
      tracking_number: p.tracking_number,
      status: p.status as PackageStatus,
      destination: p.destination,
      origin: p.origin,
      description: p.description,
    });

    const { data: evts } = await supabase
      .from("tracking_events")
      .select("id, package_id, status, location, notes, created_at")
      .eq("package_id", p.id)
      .order("created_at", { ascending: false });
    setEvents(evts ?? []);
    setLoading(false);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("fr-CA", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Suivi de colis</Text>
      <Text style={styles.subtitle}>Entrez votre numéro de suivi</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Ex: LP-2024-ABCD"
          placeholderTextColor="#9ca3af"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="characters"
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Ionicons name="search" size={22} color="#fff" />
          }
        </TouchableOpacity>
      </View>

      {notFound && (
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={40} color="#f87171" />
          <Text style={styles.notFoundText}>Colis introuvable</Text>
          <Text style={styles.notFoundSub}>Vérifiez le numéro et réessayez.</Text>
        </View>
      )}

      {result && (
        <>
          <View style={[styles.statusCard, { backgroundColor: STATUS_COLORS[result.status].bg }]}>
            <Text style={[styles.statusLabel, { color: STATUS_COLORS[result.status].text }]}>
              {STATUS_LABELS[result.status]}
            </Text>
            <Text style={styles.trackNum}>{result.tracking_number}</Text>
            <Text style={[styles.route, { color: STATUS_COLORS[result.status].text + "99" }]}>
              {result.origin} → {result.destination}
            </Text>
          </View>

          <View style={styles.timelineCard}>
            <Text style={styles.timelineTitle}>Historique de suivi</Text>
            {events.map((event, index) => (
              <View key={event.id} style={styles.timelineItem}>
                <View style={styles.timelineLine}>
                  <View style={[styles.dot, index === 0 && styles.dotActive]} />
                  {index < events.length - 1 && <View style={styles.connector} />}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.evtStatus}>{event.status}</Text>
                  {event.location && (
                    <View style={styles.locRow}>
                      <Ionicons name="location-outline" size={12} color="#9ca3af" />
                      <Text style={styles.evtLoc}>{event.location}</Text>
                    </View>
                  )}
                  {event.notes && <Text style={styles.evtNotes}>{event.notes}</Text>}
                  <Text style={styles.evtDate}>{formatDate(event.created_at)}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: "800", color: "#111827", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#6b7280", marginBottom: 16 },
  searchRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  searchInput: {
    flex: 1, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#111827",
    backgroundColor: "#fff",
  },
  searchBtn: {
    backgroundColor: "#1e3a5f", borderRadius: 12, width: 50,
    alignItems: "center", justifyContent: "center",
  },
  notFound: { alignItems: "center", paddingVertical: 40 },
  notFoundText: { fontSize: 17, fontWeight: "700", color: "#374151", marginTop: 10 },
  notFoundSub: { fontSize: 14, color: "#9ca3af", marginTop: 4 },
  statusCard: { borderRadius: 16, padding: 20, marginBottom: 14 },
  statusLabel: { fontSize: 16, fontWeight: "700" },
  trackNum: { fontSize: 22, fontWeight: "800", color: "#111827", marginTop: 4, fontFamily: "monospace" },
  route: { fontSize: 13, marginTop: 4 },
  timelineCard: {
    backgroundColor: "#fff", borderRadius: 14, padding: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  timelineTitle: { fontSize: 14, fontWeight: "700", color: "#374151", marginBottom: 12 },
  timelineItem: { flexDirection: "row", gap: 12, marginBottom: 4 },
  timelineLine: { alignItems: "center", width: 16 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#d1d5db", marginTop: 2 },
  dotActive: { backgroundColor: "#1e3a5f" },
  connector: { width: 2, flex: 1, backgroundColor: "#e5e7eb", marginVertical: 2 },
  timelineContent: { flex: 1, paddingBottom: 16 },
  evtStatus: { fontSize: 14, fontWeight: "700", color: "#111827" },
  locRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  evtLoc: { fontSize: 12, color: "#6b7280" },
  evtNotes: { fontSize: 12, color: "#4b5563", marginTop: 3, fontStyle: "italic" },
  evtDate: { fontSize: 11, color: "#9ca3af", marginTop: 4 },
});
