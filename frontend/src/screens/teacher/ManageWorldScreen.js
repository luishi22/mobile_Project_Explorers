import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { pickImage, uploadToCloudinary } from "../../services/cloudinary";

const ManageWorldScreen = ({ route }) => {
  const { mundoId, nombreMundo } = route.params; // Recibimos nombreMundo para el header
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [xp, setXp] = useState("10");

  // 🆕 ESTADO PARA DIFICULTAD
  const [dificultad, setDificultad] = useState("facil");

  // Estados de control
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedActId, setSelectedActId] = useState(null);

  const fetchWorldDetails = async () => {
    try {
      const response = await api.get(`/content/worlds/${mundoId}`);
      setActivities(response.data.actividades);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWorldDetails();
    }, [])
  );

  const handlePickAndUpload = async () => {
    const file = await pickImage();
    if (!file) return;

    setUploadingImg(true);
    const url = await uploadToCloudinary(file);

    if (url) {
      setImgUrl(url);
      Toast.show({ type: "success", text1: "Imagen subida correctamente" });
    }
    setUploadingImg(false);
  };

  const handleSaveActivity = async () => {
    if (!titulo || !videoUrl) {
      Toast.show({
        type: "info",
        text1: "Faltan datos",
        text2: "Título y Video requeridos",
      });
      return;
    }
    setSaving(true);
    try {
      // Inteligencia de imagen (YouTube fallback)
      let finalImg = imgUrl;
      if (!imgUrl && videoUrl.includes("v=")) {
        const videoId = videoUrl.split("v=")[1].split("&")[0];
        finalImg = `https://img.youtube.com/vi/${videoId}/0.jpg`;
      }
      if (!finalImg)
        finalImg = "https://cdn-icons-png.flaticon.com/512/3074/3074767.png";

      const dataToSend = {
        titulo,
        descripcion,
        video_url: videoUrl,
        imagen_preview: finalImg,
        recompensa_xp: parseInt(xp),
        dificultad, // 🆕 ENVIAMOS LA DIFICULTAD
      };

      let response;
      if (isEditing) {
        response = await api.put(
          `/content/worlds/${mundoId}/activity/${selectedActId}`,
          dataToSend
        );
        Toast.show({ type: "success", text1: "Actualizado" });
      } else {
        response = await api.post(
          `/content/worlds/${mundoId}/activity`,
          dataToSend
        );
        Toast.show({ type: "success", text1: "Creado" });
      }

      setActivities(response.data.actividades);
      closeModal();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo guardar",
      });
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setTitulo("");
    setDescripcion("");
    setVideoUrl("");
    setImgUrl("");
    setXp("10");
    setDificultad("facil"); // Reset dificultad
    setIsEditing(false);
    setSelectedActId(null);
  };

  const openCreate = () => {
    closeModal();
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setTitulo(item.titulo);
    setDescripcion(item.descripcion || "");
    setVideoUrl(item.video_url);
    setImgUrl(item.imagen_preview);
    setXp(item.recompensa_xp.toString());
    setDificultad(item.dificultad || "facil"); // Cargar dificultad existente
    setIsEditing(true);
    setSelectedActId(item._id);
    setModalVisible(true);
  };

  const handleDeleteActivity = (activityId) => {
    Alert.alert("Eliminar", "¿Seguro?", [
      { text: "Cancelar" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await api.delete(
              `/content/worlds/${mundoId}/activity/${activityId}`
            );
            setActivities(response.data.actividades);
            Toast.show({ type: "success", text1: "Eliminado" });
          } catch (error) {
            Toast.show({ type: "error", text1: "Error" });
          }
        },
      },
    ]);
  };

  // Helper para color de dificultad
  const getDiffColor = (diff) => {
    if (diff === "facil") return "#81C784"; // Verde
    if (diff === "medio") return "#FFB74D"; // Naranja
    if (diff === "dificil") return "#E57373"; // Rojo
    return "#ccc";
  };

  const renderActivity = ({ item, index }) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => Linking.openURL(item.video_url)}>
        <Image
          source={{
            uri: item.imagen_preview || "https://via.placeholder.com/100",
          }}
          style={styles.activityImage}
        />
        <View style={styles.playOverlay}>
          <Ionicons name="play" size={20} color="#fff" />
        </View>

        {/* Etiqueta de Dificultad en la imagen */}
        <View
          style={[
            styles.diffTag,
            { backgroundColor: getDiffColor(item.dificultad) },
          ]}
        >
          <Text style={styles.diffTagText}>
            {item.dificultad ? item.dificultad.toUpperCase() : "FACIL"}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.cardContent}>
        <Text style={styles.actTitle}>
          {index + 1}. {item.titulo}
        </Text>
        {item.descripcion ? (
          <Text style={styles.actDesc} numberOfLines={2}>
            {item.descripcion}
          </Text>
        ) : null}

        <View style={styles.footerRow}>
          <Text style={styles.xpBadge}>{item.recompensa_xp} XP</Text>

          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={() => openEdit(item)}
              style={{ marginRight: 15 }}
            >
              <Ionicons name="create-outline" size={22} color="#1976D2" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteActivity(item._id)}>
              <Ionicons name="trash-outline" size={22} color="#D32F2F" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Gestionando: {nombreMundo}</Text>
      <Text style={styles.infoText}>
        Agrega actividades con diferentes dificultades.
      </Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#D84315"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item._id || Math.random().toString()}
          renderItem={renderActivity}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <Ionicons name="film-outline" size={40} color="#ccc" />
              <Text style={styles.empty}>No hay actividades.</Text>
            </View>
          }
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={openCreate}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              {isEditing ? "Editar Actividad" : "Nueva Actividad"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Título"
              value={titulo}
              onChangeText={setTitulo}
            />
            <TextInput
              style={[styles.input, { height: 60, textAlignVertical: "top" }]}
              placeholder="Descripción"
              multiline
              value={descripcion}
              onChangeText={setDescripcion}
            />
            <TextInput
              style={styles.input}
              placeholder="Link Video (YouTube)"
              value={videoUrl}
              onChangeText={setVideoUrl}
            />

            {/* 🆕 SELECTOR DE DIFICULTAD */}
            <Text style={styles.label}>Dificultad:</Text>
            <View style={styles.diffRow}>
              {["facil", "medio", "dificil"].map((diff) => (
                <TouchableOpacity
                  key={diff}
                  onPress={() => setDificultad(diff)}
                  style={[
                    styles.diffBtn,
                    dificultad === diff && styles.diffBtnActive,
                    { backgroundColor: getDiffColor(diff) },
                  ]}
                >
                  <Text
                    style={[
                      styles.diffText,
                      dificultad !== diff && { opacity: 0.7 },
                    ]}
                  >
                    {diff.toUpperCase()}
                  </Text>
                  {dificultad === diff && (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* SECCIÓN IMAGEN */}
            <Text style={styles.label}>Imagen de Portada (Opcional):</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              {imgUrl ? (
                <Image
                  source={{ uri: imgUrl }}
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
                      {imgUrl ? "Cambiar Foto" : "Subir Foto"}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <Text>Puntos (XP): </Text>
              <TextInput
                style={[
                  styles.input,
                  { width: 60, marginLeft: 10, marginBottom: 0 },
                ]}
                value={xp}
                onChangeText={setXp}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={closeModal} style={styles.btnCancel}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveActivity}
                style={styles.btnSave}
              >
                {saving ? (
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
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 5,
  },
  infoText: {
    color: "#666",
    marginBottom: 10,
    fontSize: 12,
    textAlign: "center",
  },
  empty: { textAlign: "center", marginTop: 10, color: "#aaa" },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
  },
  activityImage: { width: 100, height: 100, resizeMode: "cover" },
  playOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Etiqueta visual de dificultad
  diffTag: {
    position: "absolute",
    bottom: 5,
    left: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  diffTagText: { color: "#fff", fontSize: 9, fontWeight: "bold" },

  cardContent: { flex: 1, padding: 10, justifyContent: "space-between" },
  actTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  actDesc: { fontSize: 12, color: "#666", marginBottom: 8 },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  xpBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: "bold",
    color: "#E65100",
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#D84315",
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
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    width: "100%",
    fontSize: 14,
  },
  label: { fontSize: 12, color: "#666", marginBottom: 5, fontWeight: "bold" },

  // Estilos del Selector de Dificultad
  diffRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  diffBtn: {
    flex: 1,
    padding: 8,
    marginHorizontal: 3,
    borderRadius: 6,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    opacity: 0.6,
  },
  diffBtnActive: { opacity: 1, borderWidth: 2, borderColor: "#333" },
  diffText: { color: "#fff", fontWeight: "bold", fontSize: 11, marginRight: 3 },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  btnCancel: { padding: 12, flex: 1, alignItems: "center" },
  btnSave: {
    backgroundColor: "#D84315",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginLeft: 10,
  },
});

export default ManageWorldScreen;
