import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";
import Toast from "react-native-toast-message";
import { CommonActions } from "@react-navigation/native"; // Para resetear navegación

const CreateChildScreen = ({ route, navigation }) => {
  const { aulaId, aulaNombre } = route.params; // Recibimos el ID del aula

  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [genero, setGenero] = useState("niño"); // 'niño' | 'niña'
  const [loading, setLoading] = useState(false);

  const handleCreateChild = async () => {
    if (!nombre.trim() || !edad.trim()) {
      Toast.show({
        type: "info",
        text1: "Faltan datos",
        text2: "Completa el nombre y la edad",
      });
      return;
    }

    setLoading(true);
    try {
      // Enviamos al backend
      await api.post("/students", {
        nombre,
        edad: parseInt(edad),
        genero,
        aula_id: aulaId,
      });

      Toast.show({
        type: "success",
        text1: "¡Perfil Creado!",
        text2: "Ahora puedes ver las actividades",
      });

      // TRUCO: Reseteamos la navegación para ir al HOME y que no pueda volver atrás
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "ParentHome" }],
        })
      );
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo crear el perfil",
      });
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Creando perfil para:</Text>
      <Text style={styles.classroomName}>{aulaNombre}</Text>

      <View style={styles.card}>
        {/* Input Nombre */}
        <Text style={styles.label}>Nombre del Niño/a</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Pepito"
          value={nombre}
          onChangeText={setNombre}
        />

        {/* Input Edad */}
        <Text style={styles.label}>Edad (Años)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 5"
          value={edad}
          onChangeText={setEdad}
          keyboardType="numeric"
          maxLength={2}
        />

        {/* Selector Género (Para el Avatar) */}
        <Text style={styles.label}>Personaje</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[styles.genderBtn, genero === "niño" && styles.boySelected]}
            onPress={() => setGenero("niño")}
          >
            <Image
              source={{
                uri: "https://cdn-icons-png.flaticon.com/512/9136/9136628.png",
              }}
              style={styles.avatarImg}
            />
            <Text style={styles.genderText}>Niño</Text>
            {genero === "niño" && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color="#1976D2"
                style={styles.check}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.genderBtn, genero === "niña" && styles.girlSelected]}
            onPress={() => setGenero("niña")}
          >
            <Image
              source={{
                uri: "https://cdn-icons-png.flaticon.com/512/4509/4509555.png",
              }}
              style={styles.avatarImg}
            />
            <Text style={styles.genderText}>Niña</Text>
            {genero === "niña" && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color="#D81B60"
                style={styles.check}
              />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleCreateChild}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>¡LISTO!</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FF8F00",
    padding: 20,
    alignItems: "center",
  },
  headerTitle: { color: "rgba(255,255,255,0.8)", fontSize: 18, marginTop: 20 },
  classroomName: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
  },

  card: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 25,
    padding: 25,
    elevation: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 10,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },

  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 20,
  },
  genderBtn: {
    width: "48%",
    backgroundColor: "#FAFAFA",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },

  boySelected: { borderColor: "#1976D2", backgroundColor: "#E3F2FD" },
  girlSelected: { borderColor: "#D81B60", backgroundColor: "#FCE4EC" },

  avatarImg: { width: 60, height: 60, marginBottom: 10 },
  genderText: { fontWeight: "bold", color: "#555" },
  check: { position: "absolute", top: 5, right: 5 },

  saveBtn: {
    backgroundColor: "#2E7D32",
    padding: 18,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 1,
  },
});

export default CreateChildScreen;
