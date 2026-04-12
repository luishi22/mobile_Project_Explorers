import React, { useState } from "react";
import Toast from "react-native-toast-message";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";

const ResetPasswordScreen = ({ route, navigation }) => {
  // Recibimos el correo de la pantalla anterior automáticamente
  const { email } = route.params;

  const [pin, setPin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mismo fondo
  const bgImage = require("../../../assets/images/bgImage/LOGIN.png");

  const handleResetPassword = async () => {
    // 1. Validaciones básicas
    if (
      pin.trim() === "" ||
      newPassword.trim() === "" ||
      confirmPassword.trim() === ""
    ) {
      Toast.show({
        type: "info",
        text1: "Faltan datos",
        text2: "Por favor llena todos los campos",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Las contraseñas no coinciden",
      });
      return;
    }

    setIsLoading(true);
    try {
      // 2. Llamamos al backend para cambiar la clave
      const response = await api.post("/auth/resetpassword", {
        email,
        pin,
        newPassword,
      });

      Toast.show({
        type: "success",
        text1: "¡Misión Cumplida!",
        text2: response.data.message || "Tu contraseña ha sido actualizada",
      });

      // 3. Limpiamos el historial y lo dejamos en Login sin posibilidad de volver
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Código Inválido",
        text2:
          error.response?.data?.message ||
          "El código es incorrecto o ya expiró",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={bgImage}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar style="light" />
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, justifyContent: "center" }}
        >
          {/* BOTÓN DE VOLVER ARRIBA */}
          <TouchableOpacity
            style={styles.backArrow}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back-circle" size={40} color="#fff" />
          </TouchableOpacity>

          <View style={styles.card}>
            {/* Ícono decorativo */}
            <View style={{ alignItems: "center", marginBottom: 10 }}>
              <Ionicons name="key-outline" size={60} color="#4f5eb4ff" />
            </View>

            <Text style={styles.cardTitle}>Nueva Clave</Text>
            <Text style={styles.cardSubtitle}>
              Ingresa el código de 6 dígitos que enviamos a {email}
            </Text>

            {/* INPUT PIN */}
            <TextInput
              style={styles.input}
              placeholder="Código de 6 números"
              placeholderTextColor="#888"
              keyboardType="number-pad"
              maxLength={6}
              value={pin}
              onChangeText={setPin}
            />

            {/* INPUT NUEVA CONTRASEÑA */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Nueva Contraseña"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye" : "eye-off"}
                  size={24}
                  color="#888"
                />
              </TouchableOpacity>
            </View>

            {/* INPUT CONFIRMAR CONTRASEÑA */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Repetir Contraseña"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye" : "eye-off"}
                  size={24}
                  color="#888"
                />
              </TouchableOpacity>
            </View>

            {/* BOTÓN GUARDAR */}
            <TouchableOpacity
              style={styles.mainButton}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.mainButtonText}>GUARDAR CLAVE</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  // Mismos estilos exactos que ya venimos manejando
  background: { flex: 1, width: "100%" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 20,
    justifyContent: "center",
  },
  backArrow: {
    position: "absolute",
    top: 40,
    left: 0,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  card: {
    backgroundColor: "#ffffffd8",
    borderRadius: 25,
    padding: 25,
    elevation: 8,
    marginTop: 20,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#4f5eb4ff",
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 5,
  },
  input: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#E3F2FD",
    fontSize: 16,
    textAlign: "center", // Centramos el texto para que parezca un PIN
    letterSpacing: 2,
    fontWeight: "bold",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#E3F2FD",
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 60,
  },
  inputPassword: {
    flex: 1,
    fontSize: 16,
    height: "100%",
    color: "#000",
  },
  eyeIcon: {
    padding: 5,
  },
  mainButton: {
    backgroundColor: "#FF8A65",
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#FF5722",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginTop: 10,
  },
  mainButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 1,
  },
});

export default ResetPasswordScreen;
