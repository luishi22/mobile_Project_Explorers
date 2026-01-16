import React, { useState, useCallback, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image, // 👈 1. IMPORTAR IMAGE
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import * as Clipboard from "expo-clipboard";

const TeacherHomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext); // user ya trae foto_perfil
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [className, setClassName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchClassrooms = async () => {
    try {
      const response = await api.get("/classrooms/my-classrooms");
      setClassrooms(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchClassrooms();
    }, [])
  );

  const handleCopyCode = async (code) => {
    await Clipboard.setStringAsync(code);
    Toast.show({
      type: "success",
      text1: "¡Copiado!",
      text2: `Código ${code} copiado al portapapeles 📋`,
    });
  };

  const openCreateModal = () => {
    setClassName("");
    setIsEditing(false);
    setSelectedId(null);
    setModalVisible(true);
  };

  const openEditModal = (item) => {
    setClassName(item.nombre);
    setIsEditing(true);
    setSelectedId(item._id);
    setModalVisible(true);
  };

  const handleSaveClassroom = async () => {
    if (!className.trim()) {
      Toast.show({ type: "info", text1: "Falta nombre" });
      return;
    }
    setProcessing(true);
    try {
      if (isEditing) {
        await api.put(`/classrooms/${selectedId}`, { nombre: className });
        Toast.show({ type: "success", text1: "Actualizado" });
      } else {
        await api.post("/classrooms", { nombre: className });
        Toast.show({ type: "success", text1: "Creado" });
      }
      setModalVisible(false);
      fetchClassrooms();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo guardar",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteClassroom = (id) => {
    Alert.alert("Eliminar Aula", "¿Seguro? Se borrará todo.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/classrooms/${id}`);
            fetchClassrooms();
            Toast.show({ type: "success", text1: "Eliminado" });
          } catch (error) {
            Toast.show({ type: "error", text1: "Error" });
          }
        },
      },
    ]);
  };

  const renderClassroomItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("TeacherClass", {
          aulaId: item._id,
          nombreAula: item.nombre,
        })
      }
    >
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <View style={styles.iconContainer}>
            <Ionicons name="school" size={24} color="#2E7D32" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.nombre}</Text>
            <Text style={styles.studentCount}>
              {item.alumnos ? item.alumnos.length : 0} Estudiantes
            </Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={() => openEditModal(item)}
            style={styles.iconBtn}
          >
            <Ionicons name="create-outline" size={22} color="#1976D2" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteClassroom(item._id)}
            style={styles.iconBtn}
          >
            <Ionicons name="trash-outline" size={22} color="#D32F2F" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      <TouchableOpacity
        style={styles.codeContainer}
        onPress={() => handleCopyCode(item.codigo_acceso)}
        activeOpacity={0.7}
      >
        <Text style={styles.codeLabel}>
          CÓDIGO: <Text style={styles.codeHighlight}>{item.codigo_acceso}</Text>
        </Text>
        <Ionicons
          name="copy-outline"
          size={16}
          color="#2E7D32"
          style={{ marginLeft: 8 }}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* 👇 2. HEADER MEJORADO CON FOTO */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hola Profe,</Text>
          <Text style={styles.userName}>{user?.nombre}</Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
          style={styles.profileBtn}
        >
          {user?.foto_perfil ? (
            <Image
              source={{ uri: user.foto_perfil }}
              style={styles.profileAvatar}
            />
          ) : (
            <Ionicons name="settings-outline" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mis Aulas</Text>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#2E7D32" />
        ) : (
          <FlatList
            data={classrooms}
            keyExtractor={(item) => item._id}
            renderItem={renderClassroomItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={fetchClassrooms}
              />
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>No tienes aulas.</Text>
            }
          />
        )}
      </View>

      <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              {isEditing ? "Editar Aula" : "Nueva Aula"}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nombre del Aula"
              value={className}
              onChangeText={setClassName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleSaveClassroom}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    backgroundColor: "#2E7D32",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  welcomeText: { color: "rgba(255,255,255,0.8)", fontSize: 16 },
  userName: { color: "#fff", fontSize: 24, fontWeight: "bold" },

  // 👇 3. ESTILOS NUEVOS PARA EL BOTÓN DE PERFIL
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden", // Importante para que la foto sea redonda
  },
  profileAvatar: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  // 👆 FIN ESTILOS NUEVOS

  content: { flex: 1, padding: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  studentCount: { fontSize: 12, color: "#666" },
  actionButtons: { flexDirection: "row" },
  iconBtn: { marginLeft: 10, padding: 5 },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 10 },
  codeContainer: {
    backgroundColor: "#FAFAFA",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A5D6A7",
    borderStyle: "dashed",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  codeLabel: { fontSize: 14, color: "#555", fontWeight: "bold" },
  codeHighlight: { color: "#2E7D32", fontSize: 16, letterSpacing: 1 },
  emptyText: { textAlign: "center", marginTop: 50, color: "#888" },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF8F00",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: { backgroundColor: "#eee" },
  createButton: { backgroundColor: "#2E7D32" },
  cancelButtonText: { color: "#666", fontWeight: "bold" },
  createButtonText: { color: "#fff", fontWeight: "bold" },
});

export default TeacherHomeScreen;
