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
  Linking,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import {
  pickImage,
  pickDocument,
  uploadToCloudinary,
} from "../../services/cloudinary";

const { width, height } = Dimensions.get("window");

const TeacherPostsScreen = ({ route }) => {
  const { aulaId, nombreAula } = route.params;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados del Formulario
  const [modalVisible, setModalVisible] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [tipo, setTipo] = useState("aviso");
  const [attachments, setAttachments] = useState([]);

  // Control
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Visor
  const [fullImageVisible, setFullImageVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState("");

  const fetchPosts = async () => {
    try {
      const response = await api.get(`/content/posts/classroom/${aulaId}`);
      setPosts(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [])
  );

  // 🎨 NUEVO: FUNCIÓN PARA DETECTAR TIPO DE ARCHIVO
  const getFileInfo = (filename) => {
    if (!filename) return { icon: "document", color: "#9E9E9E", label: "DOC" };

    const ext = filename.split(".").pop().toLowerCase();

    if (ext.includes("pdf"))
      return { icon: "document-text", color: "#D32F2F", label: "PDF" }; // Rojo
    if (ext.includes("doc"))
      return { icon: "document", color: "#1976D2", label: "WORD" }; // Azul
    if (ext.includes("xls"))
      return { icon: "grid", color: "#388E3C", label: "EXCEL" }; // Verde
    if (ext.includes("ppt"))
      return { icon: "easel", color: "#F57C00", label: "PPT" }; // Naranja
    if (ext.includes("txt"))
      return { icon: "text", color: "#616161", label: "TXT" }; // Gris

    return {
      icon: "document-attach",
      color: "#757575",
      label: ext.toUpperCase().substring(0, 3),
    }; // Genérico
  };

  const addAttachment = async (pickerFunction) => {
    // 1. Ejecutar picker (devuelve objeto {uri, type, name})
    const file = await pickerFunction();
    if (!file) return;

    setUploading(true);

    // 2. Subir (recibe objeto {uri, type, name})
    const url = await uploadToCloudinary(file);

    if (url) {
      // 3. Agregar al estado local
      const isImage = file.name.match(/\.(jpeg|jpg|png|gif|webp|heic)$/i);
      const realType = isImage ? "image" : "file";

      setAttachments((prev) => [
        ...prev,
        { url: url, tipo: realType, nombre: file.name },
      ]);
      Toast.show({ type: "success", text1: "Adjuntado correctamente" });
    }
    setUploading(false);
  };

  const removeAttachment = (indexToRemove) => {
    setAttachments((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSavePost = async () => {
    if (!titulo || !contenido) {
      Toast.show({ type: "info", text1: "Faltan datos" });
      return;
    }
    setSaving(true);
    try {
      const dataToSend = {
        titulo,
        contenido,
        tipo,
        adjuntos: attachments,
        aula_id: aulaId,
      };

      if (isEditing) {
        await api.put(`/content/posts/${selectedPostId}`, dataToSend);
        Toast.show({ type: "success", text1: "Actualizado" });
      } else {
        await api.post("/content/posts", dataToSend);
        Toast.show({ type: "success", text1: "Publicado" });
      }
      closeModal();
      fetchPosts();
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
    setContenido("");
    setTipo("aviso");
    setAttachments([]);
    setIsEditing(false);
    setSelectedPostId(null);
  };

  const openCreate = () => {
    closeModal();
    setModalVisible(true);
  };

  const openEdit = (post) => {
    setTitulo(post.titulo);
    setContenido(post.contenido);
    setTipo(post.tipo);
    setAttachments(post.adjuntos || []);
    setIsEditing(true);
    setSelectedPostId(post._id);
    setModalVisible(true);
  };

  const handleDeletePost = (id) => {
    Alert.alert("Eliminar", "¿Borrar?", [
      { text: "Cancelar" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/content/posts/${id}`);
            fetchPosts();
          } catch (err) {
            Toast.show({ type: "error", text1: "Error" });
          }
        },
      },
    ]);
  };

  const openImageViewer = (uri) => {
    setSelectedImageUri(uri);
    setFullImageVisible(true);
  };

  // --- RENDER POST ITEM ---
  const renderPost = ({ item }) => {
    const sortedAttachments = item.adjuntos
      ? [...item.adjuntos].sort((a, b) => {
          if (a.tipo === "image" && b.tipo !== "image") return -1;
          if (a.tipo !== "image" && b.tipo === "image") return 1;
          return 0;
        })
      : [];

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.badge,
              item.tipo === "tip"
                ? { backgroundColor: "#FFF3E0" }
                : item.tipo === "tarea"
                ? { backgroundColor: "#E3F2FD" }
                : { backgroundColor: "#E8F5E9" },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                item.tipo === "tip"
                  ? { color: "#E65100" }
                  : item.tipo === "tarea"
                  ? { color: "#1565C0" }
                  : { color: "#2E7D32" },
              ]}
            >
              {item.tipo.toUpperCase()}
            </Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={() => openEdit(item)}
              style={{ marginRight: 15 }}
            >
              <Ionicons name="create-outline" size={20} color="#1976D2" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeletePost(item._id)}>
              <Ionicons name="trash-outline" size={20} color="#D32F2F" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.postTitle}>{item.titulo}</Text>
        <Text style={styles.postContent}>{item.contenido}</Text>

        {sortedAttachments.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 10 }}
          >
            {sortedAttachments.map((att, index) => {
              // Obtenemos info visual del archivo
              const fileInfo =
                att.tipo !== "image" ? getFileInfo(att.nombre) : null;

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() =>
                    att.tipo === "image"
                      ? openImageViewer(att.url)
                      : Linking.openURL(
                          att.url.replace("/upload/", "/upload/fl_attachment/")
                        )
                  }
                  style={[
                    styles.listThumb,
                    att.tipo !== "image" && {
                      borderColor: fileInfo.color,
                      backgroundColor: "#FAFAFA",
                    },
                  ]}
                >
                  {att.tipo === "image" ? (
                    <Image source={{ uri: att.url }} style={styles.fullImage} />
                  ) : (
                    // 🎨 Visualización Específica del Archivo
                    <View style={styles.docCenter}>
                      <Ionicons
                        name={fileInfo.icon}
                        size={28}
                        color={fileInfo.color}
                      />
                      <Text
                        style={[styles.docText, { color: fileInfo.color }]}
                        numberOfLines={1}
                      >
                        {fileInfo.label}
                      </Text>
                      {/* Nombre real pequeño abajo */}
                      <Text style={styles.docMiniName} numberOfLines={1}>
                        {att.nombre}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    );
  };

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
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={renderPost}
          contentContainerStyle={{ padding: 15 }}
          ListEmptyComponent={
            <Text style={styles.empty}>No hay noticias.</Text>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={openCreate}>
        <Ionicons name="pencil" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              {isEditing ? "Editar" : "Nuevo"} Mensaje
            </Text>

            <View
              style={{
                flexDirection: "row",
                marginBottom: 15,
                justifyContent: "space-around",
              }}
            >
              {["aviso", "tip", "tarea"].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTipo(t)}
                  style={[styles.typeBtn, tipo === t && styles.typeBtnActive]}
                >
                  <Text
                    style={[styles.typeText, tipo === t && { color: "#fff" }]}
                  >
                    {t.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Título"
              value={titulo}
              onChangeText={setTitulo}
            />
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: "top" }]}
              placeholder="Mensaje..."
              multiline
              value={contenido}
              onChangeText={setContenido}
            />

            <Text style={styles.sectionLabel}>
              Archivos Adjuntos ({attachments.length})
            </Text>
            <View style={styles.galleryArea}>
              <View style={styles.addButtonsColumn}>
                <TouchableOpacity
                  style={styles.miniAddBtn}
                  onPress={() => addAttachment(pickImage)}
                  disabled={uploading}
                >
                  <Ionicons name="image" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.miniAddBtn,
                    { backgroundColor: "#FF8F00", marginTop: 8 },
                  ]}
                  onPress={() => addAttachment(pickDocument)}
                  disabled={uploading}
                >
                  <Ionicons name="document" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginLeft: 10 }}
              >
                {uploading && (
                  <View style={styles.loadingBox}>
                    <ActivityIndicator color="#2E7D32" />
                  </View>
                )}

                {attachments.map((att, index) => {
                  const info =
                    att.tipo !== "image" ? getFileInfo(att.nombre) : null;
                  return (
                    <View
                      key={index}
                      style={[
                        styles.previewThumb,
                        att.tipo !== "image" && { borderColor: info.color },
                      ]}
                    >
                      {att.tipo === "image" ? (
                        <Image
                          source={{ uri: att.url }}
                          style={styles.fullImage}
                        />
                      ) : (
                        // Preview en el Modal
                        <View
                          style={[
                            styles.docPreviewBox,
                            { backgroundColor: "#FAFAFA" },
                          ]}
                        >
                          <Ionicons
                            name={info.icon}
                            size={30}
                            color={info.color}
                          />
                          <Text
                            style={[styles.docName, { color: info.color }]}
                            numberOfLines={1}
                          >
                            {info.label}
                          </Text>
                        </View>
                      )}
                      <TouchableOpacity
                        style={styles.removeBadge}
                        onPress={() => removeAttachment(index)}
                      >
                        <Ionicons name="close" size={14} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={closeModal} style={styles.btnCancel}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSavePost} style={styles.btnSave}>
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    Publicar
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={fullImageVisible} transparent={true} animationType="fade">
        <View style={styles.fullImageContainer}>
          <TouchableOpacity
            style={styles.closeImageBtn}
            onPress={() => setFullImageVisible(false)}
          >
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{ uri: selectedImageUri }}
            style={styles.fullImageLarge}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  empty: { textAlign: "center", marginTop: 40, color: "#aaa" },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: "bold" },
  postTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  postContent: { fontSize: 14, color: "#555", lineHeight: 20 },

  // Estilos de la Lista Principal
  listThumb: {
    width: 90,
    height: 90,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  fullImage: { width: "100%", height: "100%", resizeMode: "cover" },

  docCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
  },
  docText: { fontSize: 10, fontWeight: "bold", marginTop: 2 },
  docMiniName: {
    fontSize: 8,
    color: "#888",
    marginTop: 2,
    textAlign: "center",
  },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1976D2",
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
    maxHeight: "85%",
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
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    width: "100%",
  },
  typeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  typeBtnActive: { backgroundColor: "#1976D2", borderColor: "#1976D2" },
  typeText: { fontSize: 10, fontWeight: "bold", color: "#666" },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 8,
  },
  galleryArea: { flexDirection: "row", height: 100, marginBottom: 20 },
  addButtonsColumn: { justifyContent: "center" },
  miniAddBtn: {
    width: 45,
    height: 45,
    borderRadius: 8,
    backgroundColor: "#2E7D32",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  loadingBox: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  // Preview
  previewThumb: {
    width: 90,
    height: 90,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 10,
    position: "relative",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  docPreviewBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
  },
  docName: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 4,
    textAlign: "center",
  },

  removeBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(211, 47, 47, 0.9)",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  btnCancel: { padding: 12, flex: 1, alignItems: "center" },
  btnSave: {
    backgroundColor: "#1976D2",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginLeft: 10,
  },

  fullImageContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImageLarge: { width: width, height: height * 0.8 },
  closeImageBtn: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 10,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
  },
});

export default TeacherPostsScreen;
