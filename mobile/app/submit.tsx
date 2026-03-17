import { useEffect, useState } from "react";
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Switch, Image,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { Route, PackageCategory, CATEGORY_LABELS, estimatePrice, formatCurrency } from "@/lib/types";

const CATEGORIES: PackageCategory[] = ["DOCUMENT","VETEMENT","ELECTRONIQUE","ALIMENTAIRE","MEDICAMENT","AUTRE"];

export default function SubmitScreen() {
  const router = useRouter();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [form, setForm] = useState({
    route_id: "",
    category: "AUTRE" as PackageCategory,
    description: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    declared_value: "",
    is_urgent: false,
  });

  useEffect(() => {
    supabase.from("routes").select("*").then(({ data }) => setRoutes(data ?? []));
  }, []);

  function set(key: keyof typeof form) {
    return (val: string | boolean) => setForm(p => ({ ...p, [key]: val }));
  }

  const selectedRoute = routes.find(r => r.id === form.route_id);
  const weight = parseFloat(form.weight) || 0;
  const estimation = selectedRoute && weight > 0
    ? estimatePrice(selectedRoute, weight, form.is_urgent)
    : null;

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  }

  async function handleSubmit() {
    if (!form.route_id) { Alert.alert("Erreur", "Veuillez sélectionner une route."); return; }
    if (!form.weight) { Alert.alert("Erreur", "Veuillez indiquer le poids."); return; }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: trackingData } = await supabase.rpc("generate_tracking_number");
    const tracking_number = trackingData as string;

    let photo_url: string | null = null;
    if (photoUri) {
      const fileName = `${user.id}/${tracking_number}_${Date.now()}.jpg`;
      const response = await fetch(photoUri);
      const blob = await response.blob();
      const { data: uploadData } = await supabase.storage
        .from("package-photos")
        .upload(fileName, blob, { contentType: "image/jpeg" });
      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from("package-photos")
          .getPublicUrl(uploadData.path);
        photo_url = urlData.publicUrl;
      }
    }

    const route = selectedRoute!;
    const { error } = await supabase.from("packages").insert({
      tracking_number,
      status: "SOUMIS",
      category: form.category,
      description: form.description || null,
      weight: weight,
      length: parseFloat(form.length) || null,
      width: parseFloat(form.width) || null,
      height: parseFloat(form.height) || null,
      declared_value: parseFloat(form.declared_value) || null,
      is_urgent: form.is_urgent,
      route_id: form.route_id,
      direction: route.direction,
      origin: route.origin_city,
      destination: route.destination_city,
      estimated_price: estimation,
      submitted_by: user.id,
      photo_url,
    });

    setLoading(false);
    if (error) {
      Alert.alert("Erreur", error.message);
    } else {
      Alert.alert(
        "Colis soumis",
        `Votre colis ${tracking_number} a été soumis. Notre équipe le validera sous 24h.`,
        [{ text: "OK", onPress: () => router.replace("/(tabs)/mes-colis") }],
      );
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Route */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Route *</Text>
        <View style={styles.routeList}>
          {routes.map(r => (
            <TouchableOpacity
              key={r.id}
              style={[styles.routeOption, form.route_id === r.id && styles.routeOptionActive]}
              onPress={() => set("route_id")(r.id)}
            >
              <Text style={[styles.routeName, form.route_id === r.id && styles.routeNameActive]}>{r.name}</Text>
              <Text style={[styles.routePrice, form.route_id === r.id && styles.routePriceActive]}>
                À partir de {formatCurrency(r.base_price)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Category */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Catégorie</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, form.category === cat && styles.categoryChipActive]}
              onPress={() => set("category")(cat)}
            >
              <Text style={[styles.categoryText, form.category === cat && styles.categoryTextActive]}>
                {CATEGORY_LABELS[cat]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Weight & Dimensions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Poids & dimensions</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Poids (kg) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 2.5"
            placeholderTextColor="#9ca3af"
            value={form.weight}
            onChangeText={set("weight")}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.row3}>
          {[
            { key: "length" as const, label: "Long. (cm)" },
            { key: "width" as const, label: "Larg. (cm)" },
            { key: "height" as const, label: "Haut. (cm)" },
          ].map(({ key, label }) => (
            <View key={key} style={{ flex: 1 }}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#9ca3af"
                value={form[key]}
                onChangeText={set(key)}
                keyboardType="decimal-pad"
              />
            </View>
          ))}
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Décrivez le contenu de votre colis..."
          placeholderTextColor="#9ca3af"
          value={form.description}
          onChangeText={set("description")}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Declared value */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Valeur déclarée (CAD)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 500"
          placeholderTextColor="#9ca3af"
          value={form.declared_value}
          onChangeText={set("declared_value")}
          keyboardType="decimal-pad"
        />
      </View>

      {/* Urgent */}
      <View style={styles.section}>
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.sectionTitle}>Envoi urgent</Text>
            <Text style={styles.switchHint}>+20% sur le prix total</Text>
          </View>
          <Switch
            value={form.is_urgent}
            onValueChange={set("is_urgent")}
            trackColor={{ true: "#1e3a5f", false: "#d1d5db" }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Photo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Photo du colis</Text>
        <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
          ) : (
            <>
              <Ionicons name="camera-outline" size={28} color="#9ca3af" />
              <Text style={styles.photoBtnText}>Ajouter une photo</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Estimation */}
      {estimation !== null && (
        <View style={styles.estimationCard}>
          <Text style={styles.estimationLabel}>Estimation de prix</Text>
          <Text style={styles.estimationAmount}>{formatCurrency(estimation)}</Text>
          <Text style={styles.estimationNote}>
            {form.is_urgent ? "Tarif urgent (+20%)" : "Tarif standard"}
          </Text>
        </View>
      )}

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : (
            <>
              <Ionicons name="send-outline" size={20} color="#fff" />
              <Text style={styles.submitText}>Soumettre le colis</Text>
            </>
          )
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, paddingBottom: 40 },
  section: {
    backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#374151", marginBottom: 10 },
  field: { marginBottom: 10 },
  label: { fontSize: 12, fontWeight: "600", color: "#6b7280", marginBottom: 5 },
  input: {
    borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: "#111827",
    backgroundColor: "#f9fafb",
  },
  textarea: { height: 80, textAlignVertical: "top" },
  row3: { flexDirection: "row", gap: 8 },
  routeList: { gap: 8 },
  routeOption: {
    borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12,
    padding: 12, backgroundColor: "#f9fafb",
  },
  routeOptionActive: { borderColor: "#1e3a5f", backgroundColor: "#eff6ff" },
  routeName: { fontSize: 14, fontWeight: "600", color: "#374151" },
  routeNameActive: { color: "#1e3a5f" },
  routePrice: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  routePriceActive: { color: "#1e40af" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: "#e5e7eb",
  },
  categoryChipActive: { backgroundColor: "#1e3a5f", borderColor: "#1e3a5f" },
  categoryText: { fontSize: 13, fontWeight: "600", color: "#6b7280" },
  categoryTextActive: { color: "#fff" },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  switchHint: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  photoBtn: {
    borderWidth: 2, borderColor: "#e5e7eb", borderStyle: "dashed", borderRadius: 12,
    height: 120, alignItems: "center", justifyContent: "center", gap: 8,
  },
  photoPreview: { width: "100%", height: 120, borderRadius: 10 },
  photoBtnText: { fontSize: 13, color: "#9ca3af" },
  estimationCard: {
    backgroundColor: "#eff6ff", borderRadius: 14, padding: 16, marginBottom: 12, alignItems: "center",
    borderWidth: 1, borderColor: "#bfdbfe",
  },
  estimationLabel: { fontSize: 13, color: "#1e40af", fontWeight: "600" },
  estimationAmount: { fontSize: 28, fontWeight: "800", color: "#1e3a5f", marginVertical: 4 },
  estimationNote: { fontSize: 12, color: "#3b82f6" },
  submitBtn: {
    backgroundColor: "#1e3a5f", borderRadius: 14, paddingVertical: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
