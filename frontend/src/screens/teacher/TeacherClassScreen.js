import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { pickImage, uploadToCloudinary } from "../../services/cloudinary";

const TeacherClassScreen = ({ route, navigation }) => {
  const { aulaId, nombreAula } = route.params;
  const [worlds, setWorlds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado del Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [nombreMundo, setNombreMundo] = useState("");
  const [descMundo, setDescMundo] = useState("");
  const [imgMundo, setImgMundo] = useState("");

  // Estados de control
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  const fetchWorlds = async () => {
    try {
      const response = await api.get(`/content/worlds/classroom/${aulaId}`);
      setWorlds(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWorlds();
    }, [])
  );

  // 📸 LÓGICA DE SUBIDA DE IMAGEN (Corregida)
  const handlePickAndUpload = async () => {
    // 1. Seleccionar imagen (retorna objeto)
    const file = await pickImage();
    if (!file) return;

    setUploadingImg(true);
    // 2. Subir a Cloudinary
    const url = await uploadToCloudinary(file);

    if (url) {
      setImgMundo(url);
      Toast.show({ type: "success", text1: "Imagen de portada lista" });
    }
    setUploadingImg(false);
  };

  const openCreate = () => {
    setNombreMundo("");
    setDescMundo("");
    setImgMundo(
      "https://img.freepik.com/vector-gratis/fondo-paisaje-bosque-escena-natural_1308-55099.jpg"
    );
    setIsEditing(false);
    setSelectedId(null);
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setNombreMundo(item.nombre);
    setDescMundo(item.descripcion || "");
    setImgMundo(item.imagen_portada);
    setIsEditing(true);
    setSelectedId(item._id);
    setModalVisible(true);
  };

  const handleSaveWorld = async () => {
    if (!nombreMundo.trim()) {
      Toast.show({ type: "info", text1: "Falta nombre" });
      return;
    }
    setProcessing(true);
    try {
      if (isEditing) {
        // EDITAR
        await api.put(`/content/worlds/${selectedId}`, {
          nombre: nombreMundo,
          descripcion: descMundo,
          imagen_portada: imgMundo,
        });
        Toast.show({ type: "success", text1: "Actualizado" });
      } else {
        // CREAR
        await api.post("/content/worlds", {
          nombre: nombreMundo,
          descripcion: descMundo,
          imagen_portada: imgMundo,
          aula_id: aulaId,
        });
        Toast.show({ type: "success", text1: "Mundo Creado" });
      }
      setModalVisible(false);
      fetchWorlds();
    } catch (error) {
      Toast.show({ type: "error", text1: "Error al guardar" });
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteWorld = (id) => {
    Alert.alert("Eliminar Mundo", "Se borrarán todas las actividades dentro.", [
      { text: "Cancelar" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/content/worlds/${id}`);
            fetchWorlds();
            Toast.show({ type: "success", text1: "Eliminado" });
          } catch (error) {
            Toast.show({ type: "error", text1: "Error" });
          }
        },
      },
    ]);
  };

  const renderWorldItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          // Navegar para gestionar actividades dentro de este mundo
          navigation.navigate("ManageWorld", {
            mundoId: item._id,
            nombreMundo: item.nombre,
          })
        }
      >
        <Image source={{ uri: item.imagen_portada }} style={styles.cardImage} />
        <View style={styles.cardOverlay}>
          <Text style={styles.cardTitle}>{item.nombre}</Text>
          {/* Mostrar descripción si existe */}
          {item.descripcion ? (
            <Text style={styles.cardDesc} numberOfLines={2}>
              {item.descripcion}
            </Text>
          ) : null}
          <Text style={styles.cardActivityCount}>
            {item.actividades ? item.actividades.length : 0} Actividades
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.editActions}>
        <TouchableOpacity
          onPress={() => openEdit(item)}
          style={styles.actionBtn}
        >
          <Ionicons name="create" size={18} color="#1976D2" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteWorld(item._id)}
          style={styles.actionBtn}
        >
          <Ionicons name="trash" size={18} color="#D32F2F" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2E7D32"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={worlds}
          keyExtractor={(item) => item._id}
          renderItem={renderWorldItem}
          contentContainerStyle={{ padding: 15 }}
          ListHeaderComponent={
            <View>
              <Text style={styles.headerTitle}>Aula: {nombreAula}</Text>

              {/* BOTÓN: NOTICIAS */}
              <TouchableOpacity
                style={styles.newsButton}
                onPress={() =>
                  navigation.navigate("TeacherPosts", { aulaId, nombreAula })
                }
              >
                <Ionicons
                  name="newspaper"
                  size={24}
                  color="#fff"
                  style={{ marginRight: 10 }}
                />
                <View>
                  <Text style={styles.newsButtonTitle}>Muro de Novedades</Text>
                  <Text style={styles.newsButtonSubtitle}>
                    Avisos y tareas para padres
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color="#fff"
                  style={{ marginLeft: "auto" }}
                />
              </TouchableOpacity>

              {/* BOTÓN: ESTUDIANTES (Nueva Característica) */}
              <TouchableOpacity
                style={styles.studentsButton}
                onPress={() =>
                  navigation.navigate("TeacherStudents", { aulaId })
                }
              >
                <Ionicons
                  name="people"
                  size={24}
                  color="#fff"
                  style={{ marginRight: 10 }}
                />
                <View>
                  <Text style={styles.newsButtonTitle}>
                    Estudiantes y Progreso
                  </Text>
                  <Text style={styles.newsButtonSubtitle}>
                    Ver lista y ranking de XP
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color="#fff"
                  style={{ marginLeft: "auto" }}
                />
              </TouchableOpacity>

              <Text style={[styles.headerTitle, { marginTop: 20 }]}>
                Mundos de Aprendizaje
              </Text>
            </View>
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No hay mundos. ¡Crea el primero!
            </Text>
          }
        />
      )}

      {/* FAB Crear Mundo */}
      <TouchableOpacity style={styles.fab} onPress={openCreate}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Modal Crear/Editar Mundo */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              {isEditing ? "Editar Mundo" : "Nuevo Mundo"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre (Ej: La Selva)"
              value={nombreMundo}
              onChangeText={setNombreMundo}
            />
            <TextInput
              style={styles.input}
              placeholder="Descripción corta"
              value={descMundo}
              onChangeText={setDescMundo}
            />

            {/* Subida de Imagen */}
            <Text style={styles.label}>Imagen de Portada:</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              {imgMundo ? (
                <Image
                  source={{ uri: imgMundo }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 5,
                    marginRight: 10,
                  }}
                />
              ) : null}

              <TouchableOpacity
                style={{
                  backgroundColor: "#E0E0E0",
                  padding: 10,
                  borderRadius: 8,
                  flex: 1,
                  alignItems: "center",
                }}
                onPress={handlePickAndUpload}
                disabled={uploadingImg}
              >
                {uploadingImg ? (
                  <ActivityIndicator size="small" color="#333" />
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons
                      name="camera"
                      size={18}
                      color="#555"
                      style={{ marginRight: 5 }}
                    />
                    <Text style={{ color: "#333" }}>
                      {imgMundo ? "Cambiar Foto" : "Subir Foto"}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.btnCancel}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveWorld}
                style={styles.btnCreate}
              >
                {processing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    Guardar
                  </Text>
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
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  emptyText: { textAlign: "center", marginTop: 30, color: "#888" },

  newsButton: {
    backgroundColor: "#1565C0",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 3,
  },
  studentsButton: {
    backgroundColor: "#7B1FA2", // Morado para Estudiantes
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
  },
  newsButtonTitle: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  newsButtonSubtitle: { color: "rgba(255,255,255,0.8)", fontSize: 12 },

  cardContainer: { marginBottom: 15, position: "relative" },
  card: { height: 150, borderRadius: 15, overflow: "hidden", elevation: 3 },
  cardImage: { width: "100%", height: "100%" },
  cardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
  },
  cardTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  cardDesc: {
    color: "#ddd",
    fontSize: 12,
    marginBottom: 4, // Agregar algo de espacio
  },
  cardActivityCount: {
    // Nuevo estilo para el conteo de actividades
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  editActions: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
  },
  actionBtn: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 20,
    marginLeft: 8,
    elevation: 5,
  },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2E7D32",
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
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  label: { fontSize: 12, color: "#666", marginBottom: 5 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  btnCancel: { padding: 10 },
  btnCreate: {
    backgroundColor: "#2E7D32",
    padding: 10,
    borderRadius: 8,
    paddingHorizontal: 20,
  },
});

export default TeacherClassScreen;
