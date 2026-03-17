import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, Image,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { Package, TrackingEvent, STATUS_LABELS, STATUS_COLORS } from "@/lib/types";

export default function PackageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: p }, { data: e }] = await Promise.all([
        supabase
          .from("packages")
          .select("id, tracking_number, status, description, weight, destination, origin, category, estimated_price, is_urgent, created_at, qr_code_url, photo_url")
          .eq("id", id)
          .single(),
        supabase
          .from("tracking_events")
          .select("id, package_id, status, location, notes, created_at")
          .eq("package_id", id)
          .order("created_at", { ascending: false }),
      ]);
      setPkg(p);
      setEvents(e ?? []);
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("fr-CA", {
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  if (loading) return (
    <View style={styles.centered}><ActivityIndicator size="large" color="#1e3a5f" /></View>
  );
  if (!pkg) return (
    <View style={styles.centered}><Text style={styles.notFound}>Colis introuvable</Text></View>
  );

  const colors = STATUS_COLORS[pkg.status];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status card */}
      <View style={[styles.statusCard, { backgroundColor: colors.bg }]}>
        <View style={styles.statusHeader}>
          <Text style={[styles.statusLabel, { color: colors.text }]}>{STATUS_LABELS[pkg.status]}</Text>
          {pkg.is_urgent && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>URGENT</Text>
            </View>
          )}
        </View>
        <Text style={styles.trackingNum}>{pkg.tracking_number}</Text>
        <Text style={[styles.statusSub, { color: colors.text + "99" }]}>
          {pkg.origin} → {pkg.destination}
        </Text>
      </View>

      {/* Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Informations</Text>
        {[
          { label: "Catégorie", value: pkg.category },
          { label: "Poids", value: pkg.weight ? `${pkg.weight} kg` : "—" },
          { label: "Estimation", value: pkg.estimated_price
            ? new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(pkg.estimated_price)
            : "—" },
          { label: "Soumis le", value: formatDate(pkg.created_at) },
        ].map(item => (
          <View key={item.label} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{item.label}</Text>
            <Text style={styles.detailValue}>{item.value}</Text>
          </View>
        ))}
        {pkg.description && (
          <View style={styles.description}>
            <Text style={styles.descLabel}>Description</Text>
            <Text style={styles.descText}>{pkg.description}</Text>
          </View>
        )}
      </View>

      {/* Photo */}
      {pkg.photo_url && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Photo du colis</Text>
          <Image source={{ uri: pkg.photo_url }} style={styles.photo} resizeMode="cover" />
        </View>
      )}

      {/* QR Code */}
      {pkg.qr_code_url && (
        <View style={[styles.card, styles.qrCard]}>
          <Text style={styles.cardTitle}>QR Code</Text>
          <Image source={{ uri: pkg.qr_code_url }} style={styles.qrCode} resizeMode="contain" />
          <Text style={styles.qrHint}>Scannez pour suivre ce colis</Text>
        </View>
      )}

      {/* Timeline */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Historique ({events.length})</Text>
        {events.length === 0 ? (
          <Text style={styles.noEvents}>Aucun événement de suivi</Text>
        ) : (
          events.map((event, index) => (
            <View key={event.id} style={styles.timelineItem}>
              <View style={styles.timelineLine}>
                <View style={[styles.timelineDot, index === 0 && styles.timelineDotActive]} />
                {index < events.length - 1 && <View style={styles.timelineConnector} />}
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineStatus}>{event.status}</Text>
                {event.location && (
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={12} color="#9ca3af" />
                    <Text style={styles.timelineLoc}>{event.location}</Text>
                  </View>
                )}
                {event.notes && <Text style={styles.timelineNotes}>{event.notes}</Text>}
                <Text style={styles.timelineDate}>{formatDate(event.created_at)}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFound: { color: "#6b7280", fontSize: 16 },
  statusCard: { borderRadius: 16, padding: 20, marginBottom: 14 },
  statusHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statusLabel: { fontSize: 16, fontWeight: "700" },
  urgentBadge: { backgroundColor: "#fff7ed", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  urgentText: { fontSize: 11, fontWeight: "800", color: "#ea580c" },
  trackingNum: { fontSize: 22, fontWeight: "800", color: "#111827", marginTop: 4, fontFamily: "monospace" },
  statusSub: { fontSize: 13, marginTop: 4 },
  card: {
    backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#374151", marginBottom: 12 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  detailLabel: { fontSize: 13, color: "#6b7280" },
  detailValue: { fontSize: 13, fontWeight: "600", color: "#111827" },
  description: { marginTop: 12, backgroundColor: "#f9fafb", borderRadius: 8, padding: 10 },
  descLabel: { fontSize: 11, color: "#9ca3af", marginBottom: 4 },
  descText: { fontSize: 13, color: "#374151" },
  photo: { width: "100%", height: 200, borderRadius: 10 },
  qrCard: { alignItems: "center" },
  qrCode: { width: 160, height: 160, marginVertical: 8 },
  qrHint: { fontSize: 12, color: "#9ca3af" },
  noEvents: { color: "#9ca3af", fontSize: 14, textAlign: "center", paddingVertical: 12 },
  timelineItem: { flexDirection: "row", gap: 12, marginBottom: 4 },
  timelineLine: { alignItems: "center", width: 16 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#d1d5db", marginTop: 2 },
  timelineDotActive: { backgroundColor: "#1e3a5f" },
  timelineConnector: { width: 2, flex: 1, backgroundColor: "#e5e7eb", marginVertical: 2 },
  timelineContent: { flex: 1, paddingBottom: 16 },
  timelineStatus: { fontSize: 14, fontWeight: "700", color: "#111827" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  timelineLoc: { fontSize: 12, color: "#6b7280" },
  timelineNotes: { fontSize: 12, color: "#4b5563", marginTop: 3, fontStyle: "italic" },
  timelineDate: { fontSize: 11, color: "#9ca3af", marginTop: 4 },
});
