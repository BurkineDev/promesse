import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
  ActivityIndicator, ScrollView,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  function set(key: keyof typeof form) {
    return (val: string) => setForm(p => ({ ...p, [key]: val }));
  }

  async function handleRegister() {
    if (!form.name || !form.email || !form.password) {
      Alert.alert("Erreur", "Nom, email et mot de passe sont obligatoires.");
      return;
    }
    if (form.password !== form.confirm) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }
    if (form.password.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name, phone: form.phone } },
    });

    if (error) {
      Alert.alert("Erreur", error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        role: "client",
      });
    }

    setLoading(false);
    Alert.alert("Compte créé", "Bienvenue ! Vous pouvez maintenant vous connecter.", [
      { text: "OK", onPress: () => router.replace("/(tabs)") },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>LP</Text>
          </View>
          <Text style={styles.appName}>La Promesse</Text>
          <Text style={styles.appSubtitle}>Canada-Afrique</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>Créer un compte</Text>

          {[
            { key: "name" as const, label: "Nom complet *", placeholder: "Jean Dupont", keyboardType: "default" as const },
            { key: "email" as const, label: "Email *", placeholder: "votre@email.com", keyboardType: "email-address" as const },
            { key: "phone" as const, label: "Téléphone", placeholder: "+1 514 000 0000", keyboardType: "phone-pad" as const },
          ].map(({ key, label, placeholder, keyboardType }) => (
            <View key={key} style={styles.field}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#9ca3af"
                value={form[key]}
                onChangeText={set(key)}
                autoCapitalize={key === "name" ? "words" : "none"}
                keyboardType={keyboardType}
              />
            </View>
          ))}

          <View style={styles.field}>
            <Text style={styles.label}>Mot de passe *</Text>
            <TextInput
              style={styles.input}
              placeholder="Minimum 6 caractères"
              placeholderTextColor="#9ca3af"
              value={form.password}
              onChangeText={set("password")}
              secureTextEntry
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirmer le mot de passe *</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              value={form.confirm}
              onChangeText={set("confirm")}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Créer mon compte</Text>
            }
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ? </Text>
            <Link href="/(auth)/login" style={styles.link}>Se connecter</Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1e3a5f" },
  inner: { padding: 24, paddingBottom: 40 },
  header: { alignItems: "center", marginVertical: 32 },
  logoCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center", marginBottom: 10,
  },
  logoText: { fontSize: 22, fontWeight: "800", color: "#1e3a5f" },
  appName: { fontSize: 22, fontWeight: "800", color: "#fff" },
  appSubtitle: { fontSize: 13, color: "#93c5fd", marginTop: 2 },
  form: { backgroundColor: "#fff", borderRadius: 20, padding: 24 },
  formTitle: { fontSize: 20, fontWeight: "700", color: "#111827", marginBottom: 20 },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#111827",
    backgroundColor: "#f9fafb",
  },
  btn: {
    backgroundColor: "#1e3a5f", borderRadius: 10, paddingVertical: 14,
    alignItems: "center", marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { color: "#6b7280", fontSize: 14 },
  link: { color: "#1e3a5f", fontSize: 14, fontWeight: "600" },
});
