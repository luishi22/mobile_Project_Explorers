import React, { useState, useContext } from "react";
import Toast from "react-native-toast-message";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 1. CARGA DE IMÁGENES CORREGIDA (usando require)
  const bgImage = require("../../../assets/images/bgImage/LOGIN.png");
  // Asegúrate de que esta ruta sea exacta a tu archivo
  const logoImage = require("../../../assets/images/iconoLogin.png");

  // 2. DATOS PARA EL TÍTULO DE COLORES
  const titleData = [
    { letter: "P", color: "#4285F4" }, // Azul
    { letter: "E", color: "#FBBC05" }, // Amarillo
    { letter: "Q", color: "#34A853" }, // Verde
    { letter: "U", color: "#8BC34A" }, // Verde Claro
    { letter: "E", color: "#FFCA28" }, // Amarillo Oscuro
    { letter: "M", color: "#03A9F4" }, // Celeste
    { letter: "O", color: "#EA4335" }, // Rojo
    { letter: "V", color: "#3F51B5" }, // Azul Oscuro
  ];

  const handleLogin = async () => {
    if (email.trim() === "" || password.trim() === "") {
      Toast.show({
        type: "info",
        text1: "¡Faltan datos!",
        text2: "Escribe tu correo y contraseña para entrar 🧐",
        position: "top",
        visibilityTime: 4000,
      });
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      Toast.show({
        type: "error",
        text1: "Acceso Denegado",
        text2: result.msg || "Algo salió mal",
      });
    } else {
      Toast.show({
        type: "success",
        text1: "¡Bienvenido!",
        text2: "Preparando la aventura... 🚀",
      });
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
          {/* LOGO Y TÍTULO */}
          <View style={styles.logoContainer}>
            <Image source={logoImage} style={styles.logo} />

            {/* TÍTULO MULTICOLOR */}
            <View style={styles.titleContainer}>
              {titleData.map((item, index) => (
                <Text
                  key={index}
                  style={[styles.letterText, { color: item.color }]}
                >
                  {item.letter}
                </Text>
              ))}
            </View>
          </View>

          {/* TARJETA DE LOGIN */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>¡Bienvenido!</Text>
            <Text style={styles.cardSubtitle}>Ingresa tus credenciales</Text>

            {/* INPUT EMAIL */}
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="#888"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            {/* INPUT PASSWORD */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Contraseña"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
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

            {/* BOTÓN ENTRAR */}
            <TouchableOpacity
              style={styles.mainButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.mainButtonText}>ENTRAR A JUGAR</Text>
              )}
            </TouchableOpacity>

            {/* LINK REGISTRO */}
            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              style={styles.registerLink}
            >
              <Text style={styles.registerText}>
                ¿No tienes cuenta?{" "}
                <Text style={styles.registerTextBold}>Regístrate</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 20,
    justifyContent: "center",
  },
  logoContainer: { alignItems: "center", marginBottom: 30 },
  logo: { width: 100, height: 100, marginBottom: 10 },

  // ESTILOS NUEVOS PARA EL TÍTULO DE COLORES
  titleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  letterText: {
    fontSize: 38,
    fontWeight: "900",
    textShadowColor: "white", // Shadow color (red with opacity)
    textShadowOffset: { width: -1, height: 2 }, // Horizontal and vertical offset
    textShadowRadius: 5, // Blur radius
  },

  card: {
    backgroundColor: "#ffffffd8",
    borderRadius: 25,
    padding: 25,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4f5eb4ff", // Mantenemos tu azul índigo, es bonito
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
  },
  input: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 2, // Borde un poco más grueso para estilo "cartoon"
    borderColor: "#E3F2FD", // Azul muy pálido, más limpio que el verde
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#E3F2FD", // Mismo azul pálido
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
    backgroundColor: "#FF8A65", // <--- CAMBIO: Naranja Coral (Amigable y llamativo)
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
    elevation: 5,
    shadowColor: "#FF5722", // Sombra rojiza para dar profundidad 3D
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
  registerLink: { marginTop: 20, alignItems: "center" },
  registerText: { color: "#555", fontSize: 14 },
  registerTextBold: {
    color: "#FF8A65", // El texto de registro combina con el botón
    fontWeight: "bold",
  },
});

export default LoginScreen;
