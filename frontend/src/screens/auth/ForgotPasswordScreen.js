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

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Mismo fondo que el Login para mantener la consistencia
  const bgImage = require("../../../assets/images/bgImage/LOGIN.png");

  const handleSendCode = async () => {
    if (email.trim() === "") {
      Toast.show({
        type: "info",
        text1: "Falta el correo",
        text2: "Por favor ingresa tu correo electrónico 📧",
        position: "top",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/auth/forgotpassword", { email });

      Toast.show({
        type: "success",
        text1: "¡Código Enviado!",
        text2: "Revisa tu bandeja de entrada o spam 📬",
      });

      navigation.navigate("ResetPassword", { email });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          error.response?.data?.message ||
          "Hubo un problema al enviar el correo",
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

          {/* TARJETA PRINCIPAL */}
          <View style={styles.card}>
            {/* Ícono decorativo */}
            <View style={{ alignItems: "center", marginBottom: 10 }}>
              <Ionicons
                name="mail-unread-outline"
                size={60}
                color="#4f5eb4ff"
              />
            </View>

            <Text style={styles.cardTitle}>Recuperar Clave</Text>
            <Text style={styles.cardSubtitle}>
              Ingresa el correo de tu cuenta y te enviaremos una llave mágica
              (código) de 6 números.
            </Text>

            {/* INPUT EMAIL */}
            <TextInput
              style={styles.input}
              placeholder="Tu correo electrónico"
              placeholderTextColor="#888"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            {/* BOTÓN ENVIAR */}
            <TouchableOpacity
              style={styles.mainButton}
              onPress={handleSendCode}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.mainButtonText}>ENVIAR CÓDIGO</Text>
              )}
            </TouchableOpacity>
            {/* ... después del botón de ENVIAR CÓDIGO ... */}

            <TouchableOpacity
              onPress={() => {
                if (email.trim() === "") {
                  Toast.show({
                    type: "info",
                    text1: "Correo necesario",
                    text2: "Escribe tu correo para validar el código.",
                  });
                } else {
                  navigation.navigate("ResetPassword", { email });
                }
              }}
              style={{
                marginTop: 20,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="key"
                size={18}
                color="#4f5eb4ff"
                style={{ marginRight: 8 }}
              />
              <Text
                style={{ color: "#4f5eb4ff", fontWeight: "bold", fontSize: 14 }}
              >
                YA TENGO UN CÓDIGO
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  // Mismos estilos base del Login
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
    marginTop: 20, // Darle espacio a la flecha de volver
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#4f5eb4ff",
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginBottom: 25,
    marginTop: 5,
    lineHeight: 22,
  },
  input: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#E3F2FD",
    fontSize: 16,
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
  },
  mainButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 1,
  },
});

export default ForgotPasswordScreen;
