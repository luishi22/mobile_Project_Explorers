import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";
import Toast from "react-native-toast-message";

const JoinClassScreen = ({ navigation }) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerifyCode = async () => {
    if (code.length < 3) {
      Toast.show({
        type: "info",
        text1: "Código muy corto",
        text2: "Revisa el código que te dio el maestro",
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Verificamos si el código existe
      const response = await api.post("/classrooms/join", { codigo: code });

      const aulaEncontrada = response.data; // { _id, nombre, maestro_id }

      // 2. Si existe, pasamos a la siguiente pantalla para crear al niño
      // Llevamos el ID del aula como "equipaje" (params)
      Toast.show({
        type: "success",
        text1: "¡Aula Encontrada!",
        text2: `Es el salón "${aulaEncontrada.nombre}"`,
      });

      setTimeout(() => {
        navigation.navigate("CreateChild", {
          aulaId: aulaEncontrada._id,
          aulaNombre: aulaEncontrada.nombre,
        });
      }, 1000);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Código Inválido",
        text2: "No encontramos ningún aula con ese código.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/2452/2452203.png",
          }}
          style={styles.image}
        />

        <Text style={styles.title}>Ingresa el Código</Text>
        <Text style={styles.subtitle}>
          Pídele al maestro el código de acceso del salón y escríbelo aquí.
        </Text>

        <View style={styles.inputContainer}>
          <Ionicons
            name="key-outline"
            size={24}
            color="#666"
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={styles.input}
            placeholder="Ej: A1B2C3"
            placeholderTextColor="#999"
            value={code}
            onChangeText={(text) => setCode(text.toUpperCase())} // Auto mayúsculas
            maxLength={8}
            autoCapitalize="characters"
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleVerifyCode}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>BUSCAR AULA</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: {
    flex: 1,
    padding: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  image: { width: 120, height: 120, marginBottom: 30 },
  title: { fontSize: 26, fontWeight: "bold", color: "#333", marginBottom: 10 },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    width: "100%",
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    letterSpacing: 2,
  },

  button: {
    width: "100%",
    backgroundColor: "#FF8F00",
    padding: 18,
    borderRadius: 30,
    alignItems: "center",
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 1,
  },
});

export default JoinClassScreen;
