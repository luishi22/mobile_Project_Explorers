import React, { useState, useContext } from "react";
import Toast from "react-native-toast-message";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

const RegisterScreen = ({ navigation }) => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("padre");

  // ESTADO PARA VISIBILIDAD DE CONTRASEÑA
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const bgImage = require("../../../assets/images/bgImage/image.png");

  const handleRegister = async () => {
    if (nombre.trim() === "") {
      Toast.show({ type: "error", text1: "Ups", text2: "Falta tu nombre" });
      return;
    }
    if (email.trim() === "") {
      Toast.show({ type: "error", text1: "Ups", text2: "Falta tu email" });
      return;
    }
    if (password.trim() === "") {
      Toast.show({ type: "error", text1: "Ups", text2: "Falta tu contraseña" });
      return;
    }

    setLoading(true);
    const result = await register(nombre, email, password, rol);
    setLoading(false);

    if (!result.success) {
      Toast.show({
        type: "error",
        text1: "Error de Registro",
        text2: result.msg,
      });
    } else {
      Toast.show({
        type: "success",
        text1: "¡Cuenta Creada!",
        text2: "Bienvenido a bordo explorador 🗺️",
      });
    }
  };

  return (
    <ImageBackground
      source={bgImage}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar style="dark" />
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.card}>
              <View style={styles.headerIcon}>
                <Ionicons
                  name={rol === "padre" ? "people" : "school"}
                  size={50}
                  color={rol === "padre" ? "#FF8F00" : "#2E7D32"}
                />
              </View>

              <Text style={styles.cardTitle}>Nuevo Registro</Text>
              <Text style={styles.cardSubtitle}>
                Selecciona tu tipo de perfil
              </Text>

              {/* SELECTOR DE ROL */}
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    rol === "padre" && styles.roleButtonActive,
                  ]}
                  onPress={() => setRol("padre")}
                >
                  <Ionicons
                    name="home"
                    size={20}
                    color={rol === "padre" ? "#fff" : "#666"}
                  />
                  <Text
                    style={[
                      styles.roleText,
                      rol === "padre" && styles.roleTextActive,
                    ]}
                  >
                    Familiar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    rol === "maestro" && styles.roleButtonActiveTeacher,
                  ]}
                  onPress={() => setRol("maestro")}
                >
                  <Ionicons
                    name="book"
                    size={20}
                    color={rol === "maestro" ? "#fff" : "#666"}
                  />
                  <Text
                    style={[
                      styles.roleText,
                      rol === "maestro" && styles.roleTextActive,
                    ]}
                  >
                    Docente
                  </Text>
                </TouchableOpacity>
              </View>

              {/* INPUTS */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#666"
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  style={styles.input}
                  placeholderTextColor="#999"
                  placeholder="Nombre Completo"
                  value={nombre}
                  onChangeText={setNombre}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#666"
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  style={styles.input}
                  placeholderTextColor="#999"
                  placeholder="Correo Electrónico"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* INPUT DE CONTRASEÑA CON OJO */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#666"
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña (Mín 6)"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword} // Dinámico
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ padding: 5 }}
                >
                  <Ionicons
                    name={showPassword ? "eye" : "eye-off"}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.mainButton,
                  rol === "maestro"
                    ? { backgroundColor: "#2E7D32" }
                    : { backgroundColor: "#FF8F00" },
                ]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.mainButtonText}>
                    {rol === "padre"
                      ? "CREAR CUENTA FAMILIAR"
                      : "CREAR CUENTA DOCENTE"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", padding: 20 },
  backButton: {
    position: "absolute",
    top: 40,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    padding: 10,
    zIndex: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 25,
    elevation: 8,
  },
  headerIcon: { alignItems: "center", marginBottom: 5 },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  roleContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 15,
    padding: 5,
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
  },
  roleButtonActive: { backgroundColor: "#FF8F00", elevation: 2 },
  roleButtonActiveTeacher: { backgroundColor: "#2E7D32", elevation: 2 },
  roleText: { marginLeft: 8, fontWeight: "600", color: "#666" },
  roleTextActive: { color: "#fff" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  input: { flex: 1, paddingVertical: 15, fontSize: 16, color: "#333" },
  mainButton: {
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 15,
    elevation: 5,
  },
  mainButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
});

export default RegisterScreen;
