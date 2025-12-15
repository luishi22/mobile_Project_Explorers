import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import Toast from "react-native-toast-message";
import { pickImage, uploadToCloudinary } from "../../services/cloudinary";

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateUser } = useContext(AuthContext);

  const [nombre, setNombre] = useState(user?.nombre || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");

  // 👇 1. ESTADO NUEVO PARA VER CONTRASEÑA
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleChangePhoto = async () => {
    const fileResult = await pickImage();
    if (!fileResult) return;
    setUploading(true);
    const imageUrl = await uploadToCloudinary(fileResult);

    if (imageUrl) {
      try {
        const response = await api.put("/auth/profile", {
          foto_perfil: imageUrl,
        });
        await updateUser(response.data);
        Toast.show({
          type: "success",
          text1: "Foto Actualizada",
          text2: "Tu perfil se ve genial.",
        });
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Se subió la foto pero no se guardó.",
        });
      }
    }
    setUploading(false);
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const payload = { nombre, email };
      if (password.length > 0) {
        if (password.length < 6) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Mínimo 6 caracteres",
          });
          setLoading(false);
          return;
        }
        payload.password = password;
      }
      const response = await api.put("/auth/profile", payload);
      await updateUser(response.data);
      Toast.show({
        type: "success",
        text1: "Actualizado",
        text2: "Datos guardados.",
      });
      setPassword("");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo actualizar.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert("Eliminar Cuenta", "Esta acción es irreversible. ¿Seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sí, Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete("/auth/profile");
            logout();
          } catch (e) {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: "Falló la eliminación",
            });
          }
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleChangePhoto} disabled={uploading}>
          <View style={styles.avatarContainer}>
            {uploading ? (
              <ActivityIndicator size="large" color="#FF8F00" />
            ) : (
              <Image
                source={{
                  uri:
                    user?.foto_perfil ||
                    "https://cdn-icons-png.flaticon.com/512/847/847969.png",
                }}
                style={styles.avatar}
              />
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>
        <Text style={styles.role}>
          {user?.rol === "maestro" ? "Docente" : "Familiar"}
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Nombre Completo</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
        />

        <Text style={styles.label}>Correo Electrónico</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Nueva Contraseña (Opcional)</Text>

        {/* 👇 2. CONTENEDOR NUEVO PARA PASSWORD + OJO */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.inputPassword} // Estilo especial sin bordes
            value={password}
            onChangeText={setPassword}
            placeholder="Dejar vacío para no cambiar"
            // 👇 Lógica del ojo: Si showPassword es true, NO es seguro (texto plano)
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? "eye" : "eye-off"} // Cambia el icono
              size={24}
              color="#999"
            />
          </TouchableOpacity>
        </View>
        {/* 👆 FIN CONTENEDOR PASSWORD */}

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Guardar Cambios</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#D32F2F" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteText}>Eliminar mi cuenta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#fff", padding: 20 },
  header: { alignItems: "center", marginBottom: 30, marginTop: 20 },
  avatarContainer: { position: "relative", marginBottom: 10 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#eee",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#2E7D32",
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  role: {
    fontSize: 16,
    color: "#FF8F00",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 5,
  },
  form: { width: "100%" },
  label: { fontSize: 14, color: "#333", marginBottom: 5, fontWeight: "bold" },

  // Input Normal
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },

  // 👇 ESTILOS NUEVOS PARA EL PASSWORD
  passwordContainer: {
    flexDirection: "row", // Pone input e icono lado a lado
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: "#FAFAFA",
    height: 55, // Altura fija para alineación
  },
  inputPassword: {
    flex: 1, // Ocupa todo el espacio menos el icono
    fontSize: 16,
    height: "100%",
  },
  eyeIcon: {
    padding: 5,
  },
  // 👆 FIN ESTILOS PASSWORD

  saveBtn: {
    backgroundColor: "#1976D2",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 10 },
  logoutBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#FFEBEE",
    marginBottom: 10,
  },
  logoutText: { color: "#D32F2F", fontWeight: "bold", marginLeft: 10 },
  deleteBtn: { alignItems: "center", padding: 10 },
  deleteText: { color: "#999", fontSize: 12, textDecorationLine: "underline" },
});

export default ProfileScreen;
