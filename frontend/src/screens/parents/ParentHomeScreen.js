import React, { useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Linking,
  ScrollView,
  Modal,
  Dimensions,
  TextInput,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { useFocusEffect } from "@react-navigation/native";
// 👇 1. IMPORTAR ASYNC STORAGE
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const ParentHomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);

  const [children, setChildren] = useState([]);
  const [currentChild, setCurrentChild] = useState(null);
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [switching, setSwitching] = useState(false);

  const [fullImageVisible, setFullImageVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState("");

  // MODALES
  const [showChildSelector, setShowChildSelector] = useState(false);
  const [showEditChildModal, setShowEditChildModal] = useState(false);

  // EDITAR HIJO
  const [editingChild, setEditingChild] = useState(null);
  const [editName, setEditName] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editGender, setEditGender] = useState("");
  const [savingChild, setSavingChild] = useState(false);

  // 🔄 CARGAR HIJOS (CON MEMORIA)
  const fetchChildren = async () => {
    try {
      const res = await api.get("/students/my-children");
      setChildren(res.data);

      // Si no hay hijos, terminamos
      if (res.data.length === 0) {
        setLoading(false);
        return;
      }

      // 🧠 LÓGICA DE MEMORIA INTELIGENTE
      if (!currentChild) {
        // Caso A: Es la primera carga (currentChild es null)
        // Intentamos recuperar el último seleccionado de la memoria
        const lastId = await AsyncStorage.getItem("lastSelectedChildId");

        let childToSelect = res.data[0]; // Por defecto el primero

        if (lastId) {
          const found = res.data.find((c) => c._id === lastId);
          if (found) childToSelect = found;
        }

        // Seleccionamos sin animación de carga (switching false) para que se sienta instantáneo
        setCurrentChild(childToSelect);
        fetchPosts(childToSelect);
      } else {
        // Caso B: Ya teníamos uno seleccionado (volvemos de otra pantalla)
        // Solo refrescamos sus datos por si ganó XP
        const updatedCurrent = res.data.find((c) => c._id === currentChild._id);
        if (updatedCurrent) {
          setCurrentChild(updatedCurrent); // Actualizamos silenciosamente
          // Opcional: refrescar posts si quieres
        }
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const fetchPosts = async (child) => {
    if (!child?.aula_id) {
      setPosts([]);
      setLoading(false);
      setRefreshing(false);
      setSwitching(false);
      return;
    }

    try {
      const aulaId = child.aula_id._id || child.aula_id;
      const res = await api.get(`/content/posts/classroom/${aulaId}`);
      setPosts(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setSwitching(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchChildren();
    }, [])
  );

  // 💾 GUARDAR SELECCIÓN EN MEMORIA
  const handleSelectChild = async (child) => {
    setShowChildSelector(false);
    if (currentChild?._id === child._id) return;

    setSwitching(true);
    setCurrentChild(child);

    // Guardamos en el celular a quién eligió el padre
    await AsyncStorage.setItem("lastSelectedChildId", child._id);

    fetchPosts(child);
  };

  const openEditChild = (child) => {
    setEditingChild(child);
    setEditName(child.nombre);
    setEditAge(child.edad.toString());
    setEditGender(child.genero);
    setShowChildSelector(false);
    setShowEditChildModal(true);
  };

  const handleUpdateChild = async () => {
    if (!editName || !editAge)
      return Alert.alert("Error", "Completa los campos");
    setSavingChild(true);
    try {
      await api.put(`/students/${editingChild._id}`, {
        nombre: editName,
        edad: parseInt(editAge),
        genero: editGender,
      });
      setShowEditChildModal(false);
      fetchChildren();
      Alert.alert("Éxito", "Datos actualizados");
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar");
    } finally {
      setSavingChild(false);
    }
  };

  // ... (El resto de funciones auxiliares como getFileInfo, renderPost siguen igual)
  const getFileInfo = (filename) => {
    if (!filename) return { icon: "document", color: "#9E9E9E", label: "DOC" };
    const ext = filename.split(".").pop().toLowerCase();
    if (ext.includes("pdf"))
      return { icon: "document-text", color: "#D32F2F", label: "PDF" };
    if (ext.includes("doc"))
      return { icon: "document", color: "#1976D2", label: "WORD" };
    return {
      icon: "document-attach",
      color: "#757575",
      label: ext.toUpperCase().substring(0, 3),
    };
  };

  const renderPost = ({ item }) => {
    const sortedAttachments = item.adjuntos
      ? [...item.adjuntos].sort((a, b) => {
          if (a.tipo === "image" && b.tipo !== "image") return -1;
          if (a.tipo !== "image" && b.tipo === "image") return 1;
          return 0;
        })
      : [];

    const teacherName = item.autor_id ? item.autor_id.nombre : "Profe";
    const classroomName = item.aula_id
      ? item.aula_id.nombre
      : currentChild?.aula_id?.nombre || "Aula";

    return (
      <View style={styles.card}>
        <View style={styles.postHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarLetter}>{teacherName.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.authorName}>{teacherName}</Text>
            <Text style={styles.classroomName}>
              {classroomName} •{" "}
              {new Date(item.fecha_publicacion).toLocaleDateString()}
            </Text>
          </View>
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
              const info =
                att.tipo !== "image" ? getFileInfo(att.nombre) : null;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    if (att.tipo === "image") {
                      setSelectedImageUri(att.url);
                      setFullImageVisible(true);
                    } else {
                      Linking.openURL(
                        att.url.replace("/upload/", "/upload/fl_attachment/")
                      );
                    }
                  }}
                  style={[
                    styles.attachmentThumb,
                    att.tipo !== "image" && {
                      borderColor: info.color,
                      backgroundColor: "#FAFAFA",
                    },
                  ]}
                >
                  {att.tipo === "image" ? (
                    <Image
                      source={{ uri: att.url }}
                      style={styles.thumbImage}
                    />
                  ) : (
                    <View style={styles.docCenter}>
                      <Ionicons name={info.icon} size={28} color={info.color} />
                      <Text
                        style={[styles.docText, { color: info.color }]}
                        numberOfLines={1}
                      >
                        {info.label}
                      </Text>
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

  if (!loading && children.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/7486/7486747.png",
          }}
          style={styles.emptyImg}
        />
        <Text style={styles.emptyTitle}>¡Bienvenido a la Aventura!</Text>
        <Text style={styles.emptyDesc}>
          Necesitas el código que te dio el maestro.
        </Text>
        <TouchableOpacity
          style={styles.joinBtn}
          onPress={() => navigation.navigate("JoinClass")}
        >
          <Text style={styles.joinBtnText}>UNIRSE A UN AULA</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
          style={{ marginTop: 20 }}
        >
          <Text style={{ color: "#666", textDecorationLine: "underline" }}>
            Ir a Mi Perfil
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.mainHeader}>
        <View>
          <Text style={styles.welcome}>Familia de</Text>
          <TouchableOpacity
            style={styles.childSelector}
            onPress={() => setShowChildSelector(true)}
          >
            <Text style={styles.childName}>
              {currentChild ? currentChild.nombre : "Cargando..."}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color="#fff"
              style={{ marginLeft: 5 }}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
          style={styles.profileBtn}
        >
          <Ionicons name="person" size={20} color="#FF8F00" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#FF8F00"
          style={{ marginTop: 50 }}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.playSection}>
            <TouchableOpacity
              style={styles.playBtn}
              onPress={() => {
                if (currentChild) {
                  navigation.navigate("KidsMode", {
                    screen: "Map",
                    params: { child: currentChild },
                  });
                } else {
                  alert("Primero selecciona o crea un estudiante.");
                }
              }}
            >
              <View style={styles.playIconCircle}>
                <Ionicons name="game-controller" size={24} color="#FF6F00" />
              </View>
              <View>
                <Text style={styles.playTitle}>Jugar Ahora</Text>
                <Text style={styles.playSubtitle}>
                  Modo Niño • {currentChild?.nombre}
                </Text>
              </View>
              <Ionicons
                name="arrow-forward-circle"
                size={32}
                color="rgba(255,255,255,0.8)"
                style={{ marginLeft: "auto" }}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.feedLabel}>
            {switching
              ? "Cargando noticias..."
              : `Novedades: ${currentChild?.aula_id?.nombre || "Sin Aula"}`}
          </Text>

          {switching ? (
            <ActivityIndicator color="#FF8F00" />
          ) : (
            <FlatList
              data={posts}
              keyExtractor={(item) => item._id}
              renderItem={renderPost}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingBottom: 20,
              }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => fetchChildren()}
                />
              }
              ListEmptyComponent={
                <View style={{ alignItems: "center", marginTop: 30 }}>
                  <Ionicons
                    name="notifications-off-outline"
                    size={40}
                    color="#ccc"
                  />
                  <Text style={{ color: "#999", marginTop: 10 }}>
                    No hay noticias recientes.
                  </Text>
                </View>
              }
            />
          )}
        </View>
      )}

      {/* MODAL SELECTOR DE HIJOS */}
      <Modal
        visible={showChildSelector}
        transparent={true}
        animationType="slide"
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowChildSelector(false)}
        >
          <View style={styles.bottomSheet}>
            <Text style={styles.sheetTitle}>Mis Hijos</Text>

            {children.map((child) => (
              <View key={child._id} style={styles.childRowContainer}>
                <TouchableOpacity
                  style={[
                    styles.childOption,
                    currentChild?._id === child._id && styles.childOptionActive,
                  ]}
                  onPress={() => handleSelectChild(child)}
                >
                  <View
                    style={[
                      styles.optionAvatar,
                      {
                        backgroundColor:
                          child.genero === "niña" ? "#F48FB1" : "#90CAF9",
                      },
                    ]}
                  >
                    <Ionicons name="person" size={18} color="#fff" />
                  </View>
                  <Text
                    style={[
                      styles.optionText,
                      currentChild?._id === child._id && {
                        color: "#FF8F00",
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    {child.nombre}
                  </Text>
                  {currentChild?._id === child._id && (
                    <Ionicons name="checkmark" size={20} color="#FF8F00" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.editIconBtn}
                  onPress={() => openEditChild(child)}
                >
                  <Ionicons name="create-outline" size={22} color="#757575" />
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.addChildOption}
              onPress={() => {
                setShowChildSelector(false);
                navigation.navigate("JoinClass");
              }}
            >
              <View style={[styles.optionAvatar, { backgroundColor: "#eee" }]}>
                <Ionicons name="add" size={24} color="#666" />
              </View>
              <Text style={styles.addChildText}>Agregar otro estudiante</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL EDITAR HIJO */}
      <Modal
        visible={showEditChildModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.centerModalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>

            <Text style={styles.label}>Nombre:</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Ej: Pepito"
            />

            <Text style={styles.label}>Edad:</Text>
            <TextInput
              style={styles.input}
              value={editAge}
              onChangeText={setEditAge}
              keyboardType="numeric"
              maxLength={2}
              placeholder="Ej: 5"
            />

            <Text style={styles.label}>Personaje:</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[
                  styles.genderBtn,
                  editGender === "niño" && styles.boySelected,
                ]}
                onPress={() => setEditGender("niño")}
              >
                <Image
                  source={{
                    uri: "https://cdn-icons-png.flaticon.com/512/9136/9136628.png",
                  }}
                  style={styles.avatarImg}
                />
                <Text style={styles.genderText}>Niño</Text>
                {editGender === "niño" && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color="#1976D2"
                    style={styles.check}
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderBtn,
                  editGender === "niña" && styles.girlSelected,
                ]}
                onPress={() => setEditGender("niña")}
              >
                <Image
                  source={{
                    uri: "https://cdn-icons-png.flaticon.com/512/4509/4509555.png",
                  }}
                  style={styles.avatarImg}
                />
                <Text style={styles.genderText}>Niña</Text>
                {editGender === "niña" && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color="#D81B60"
                    style={styles.check}
                  />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setShowEditChildModal(false)}
                style={styles.btnCancel}
              >
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdateChild}
                style={styles.btnSave}
              >
                {savingChild ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnSaveText}>GUARDAR</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* VISOR FOTO */}
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
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  mainHeader: {
    backgroundColor: "#FF8F00",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 4,
  },
  welcome: { color: "rgba(255,255,255,0.9)", fontSize: 12 },
  childSelector: { flexDirection: "row", alignItems: "center" },
  childName: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  playSection: { padding: 20 },
  playBtn: {
    backgroundColor: "#FF6F00",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 20,
    elevation: 4,
  },
  playIconCircle: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  playTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  playSubtitle: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  feedLabel: {
    marginLeft: 20,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
  },
  postHeader: { flexDirection: "row", marginBottom: 10 },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarLetter: { fontSize: 18, fontWeight: "bold", color: "#757575" },
  authorName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  classroomName: { fontSize: 12, color: "#888" },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    height: 20,
    justifyContent: "center",
  },
  badgeText: { fontSize: 10, fontWeight: "bold" },
  postTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  postContent: { fontSize: 14, color: "#555", lineHeight: 20 },
  attachmentThumb: {
    width: 90,
    height: 90,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  thumbImage: { width: "100%", height: "100%" },
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  emptyImg: { width: 150, height: 150, marginBottom: 20 },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  emptyDesc: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  joinBtn: {
    backgroundColor: "#2E7D32",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 5,
  },
  joinBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  centerModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    paddingBottom: 40,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },

  childRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  childOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
  },
  childOptionActive: { backgroundColor: "#FFF3E0" },
  editIconBtn: { padding: 10, marginLeft: 5 },

  optionAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  optionText: { fontSize: 16, color: "#333", flex: 1 },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 15 },
  addChildOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  addChildText: { fontSize: 16, color: "#666", fontWeight: "bold" },

  modalView: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 25,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 8,
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
  genderRow: {
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
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  btnCancel: { flex: 1, padding: 15, alignItems: "center" },
  btnCancelText: { color: "#757575", fontSize: 16 },
  btnSave: {
    flex: 1,
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    elevation: 3,
  },
  btnSaveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
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

export default ParentHomeScreen;
