import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/context/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message"; // <--- Importar
import { Ionicons } from "@expo/vector-icons";

// 🎨 DISEÑO PERSONALIZADO DE LAS ALERTAS
const toastConfig = {
  // 1. Alerta de Éxito (Verde Bonito)
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#2E7D32",
        borderLeftWidth: 10,
        height: 70,
        borderRadius: 15,
        borderRightWidth: 0,
        backgroundColor: "#F1F8E9",
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 17, fontWeight: "bold", color: "#2E7D32" }}
      text2Style={{ fontSize: 14, color: "#555" }}
      renderLeadingIcon={() => (
        <View style={styles.iconContainerSuccess}>
          <Ionicons name="checkmark-circle" size={30} color="#2E7D32" />
        </View>
      )}
    />
  ),
  // 2. Alerta de Error (Rojo Suave)
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#D32F2F",
        borderLeftWidth: 10,
        height: 70,
        borderRadius: 15,
        borderRightWidth: 0,
        backgroundColor: "#FFEBEE",
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 17, fontWeight: "bold", color: "#D32F2F" }}
      text2Style={{ fontSize: 14, color: "#555" }}
      renderLeadingIcon={() => (
        <View style={styles.iconContainerError}>
          <Ionicons name="alert-circle" size={30} color="#D32F2F" />
        </View>
      )}
    />
  ),
  // 3. Alerta de Info (Azul)
  info: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#0288D1",
        borderLeftWidth: 10,
        height: 70,
        borderRadius: 15,
        borderRightWidth: 0,
        backgroundColor: "#E1F5FE",
      }}
      text1Style={{ fontSize: 17, fontWeight: "bold", color: "#0288D1" }}
      renderLeadingIcon={() => (
        <View style={styles.iconContainerInfo}>
          <Ionicons name="information-circle" size={30} color="#0288D1" />
        </View>
      )}
    />
  ),
};

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <AppNavigator />

      <Toast config={toastConfig} />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  iconContainerSuccess: { paddingLeft: 15, justifyContent: "center" },
  iconContainerError: { paddingLeft: 15, justifyContent: "center" },
  iconContainerInfo: { paddingLeft: 15, justifyContent: "center" },
});
