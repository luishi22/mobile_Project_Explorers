import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ImageBackground,
  Dimensions,
  ActivityIndicator,
  Modal,
  Animated,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";
import { useFocusEffect } from "@react-navigation/native";
import YoutubePlayer from "react-native-youtube-iframe";

const { width } = Dimensions.get("window");

const ActivityScreen = ({ route, navigation }) => {
  const { worldId, child, bgImage } = route.params;

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedActivity, setSelectedActivity] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Estados Video
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoId, setVideoId] = useState(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const fetchActivities = async () => {
    try {
      const response = await api.get(`/content/worlds/${worldId}`);
      setActivities(response.data.actividades);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchActivities();
      startPulse();
    }, [])
  );

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const getYoutubeId = (url) => {
    if (!url) return null;
    const cleanUrl = url.trim();
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = cleanUrl.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const isCompleted = (activityId) => {
    if (!child.actividades_completadas) return false;
    return child.actividades_completadas.some(
      (a) => a.actividad_id === activityId
    );
  };

  const handleOpenActivity = (item) => {
    setSelectedActivity(item);
    const id = getYoutubeId(item.video_url);
    setVideoId(id);

    // Reseteo total para evitar bugs de estados anteriores
    setShowVideoPlayer(false);
    setIsPlaying(false);

    setModalVisible(true);
  };

  const handleStartVideo = () => {
    setShowVideoPlayer(true);
    // onReady se encargará del play
  };

  const handleCloseModal = () => {
    setIsPlaying(false);
    setShowVideoPlayer(false);
    setModalVisible(false);
  };

  const handleComplete = async () => {
    if (!selectedActivity) return;
    setCompleting(true);
    try {
      await api.post(`/students/${child._id}/complete`, {
        actividad_id: selectedActivity._id,
        mundo_id: worldId,
        xp_ganado: selectedActivity.recompensa_xp,
      });
      handleCloseModal();
      navigation.navigate("Win", {
        xp: selectedActivity.recompensa_xp,
        child: child,
      });
    } catch (error) {
      handleCloseModal();
      navigation.navigate("Win", { xp: 0, child: child });
    } finally {
      setCompleting(false);
    }
  };

  // Helper para colores de dificultad
  const getDiffColor = (diff) => {
    switch (diff) {
      case "facil":
        return "#66BB6A"; // Verde
      case "medio":
        return "#FFA726"; // Naranja
      case "dificil":
        return "#EF5350"; // Rojo
      default:
        return "#B0BEC5";
    }
  };

  const renderPathNode = ({ item, index }) => {
    const completed = isCompleted(item._id);
    const prevCompleted = index === 0 || isCompleted(activities[index - 1]._id);

    let btnColor = completed
      ? "#FFD700"
      : prevCompleted
      ? "#00C853"
      : "#ECEFF1";
    let iconName = completed ? "star" : prevCompleted ? "play" : "lock-closed";
    let iconColor = completed ? "#E65100" : prevCompleted ? "#fff" : "#B0BEC5";
    let isCurrent = !completed && prevCompleted;

    const zigZagStyle = {
      marginLeft: index % 2 === 0 ? -50 : 50,
      marginBottom: 30,
    };

    return (
      <View style={{ alignItems: "center" }}>
        {index < activities.length - 1 && (
          <View
            style={[
              styles.connector,
              zigZagStyle,
              {
                height: 40,
                transform: [{ rotate: index % 2 === 0 ? "-20deg" : "20deg" }],
              },
            ]}
          />
        )}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleOpenActivity(item)}
          disabled={!completed && !prevCompleted}
        >
          <Animated.View
            style={[
              styles.levelButton,
              zigZagStyle,
              { backgroundColor: btnColor },
              isCurrent && { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Ionicons name={iconName} size={32} color={iconColor} />
            {completed && (
              <View style={styles.crown}>
                <Ionicons name="ribbon" size={20} color="#D84315" />
              </View>
            )}
          </Animated.View>

          <View style={[zigZagStyle, { alignItems: "center" }]}>
            <Text style={styles.levelLabel}>Nivel {index + 1}</Text>
            {/* 🆕 MOSTRAR DIFICULTAD EN EL CAMINO */}
            <View
              style={[
                styles.miniDiffBadge,
                { backgroundColor: getDiffColor(item.dificultad) },
              ]}
            >
              <Text style={styles.miniDiffText}>
                {item.dificultad ? item.dificultad.toUpperCase() : "FÁCIL"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <ImageBackground
        source={{ uri: bgImage }}
        style={styles.bg}
        blurRadius={3}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={30} color="#fff" />
            </TouchableOpacity>

            {/* 🆕 CONTADOR TOTAL DE MISIONES */}
            <View style={styles.missionCounter}>
              <Text style={styles.missionText}>
                🎯 {activities.length} Misiones
              </Text>
            </View>

            <View style={styles.xpCapsule}>
              <Text style={styles.xpText}>⭐ {child.progreso_xp}</Text>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#fff"
              style={{ marginTop: 100 }}
            />
          ) : (
            <FlatList
              data={activities}
              keyExtractor={(item) => item._id}
              renderItem={renderPathNode}
              contentContainerStyle={{
                paddingVertical: 40,
                alignItems: "center",
              }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        <Modal
          visible={modalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.popupCard}>
              <TouchableOpacity
                style={styles.closeBubble}
                onPress={handleCloseModal}
              >
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>

              {selectedActivity && (
                <>
                  <View style={[styles.mediaFrame, { opacity: 0.99 }]}>
                    {showVideoPlayer && videoId ? (
                      <View style={{ backgroundColor: "#000", flex: 1 }}>
                        <YoutubePlayer
                          height={200}
                          play={isPlaying}
                          videoId={videoId}
                          // 👇 AQUÍ ESTÁ EL CAMBIO
                          webViewProps={{
                            androidLayerType: "hardware", // Cambiamos 'software' por 'hardware' (o borra la línea)
                            renderToHardwareTextureAndroid: true, // Ayuda en Android
                            javaScriptEnabled: true,
                            domStorageEnabled: true,
                            allowsFullscreenVideo: true,
                          }}
                          onReady={() => {
                            setTimeout(() => setIsPlaying(true), 500);
                          }}
                          onChangeState={(state) => {
                            if (state === "ended") setIsPlaying(false);
                          }}
                          onError={(e) => console.log("Error YT:", e)}
                        />
                      </View>
                    ) : (
                      <View style={styles.coverWrapper}>
                        <Image
                          source={{
                            uri:
                              selectedActivity.imagen_preview ||
                              "https://via.placeholder.com/100",
                          }}
                          style={styles.coverImage}
                        />
                        <TouchableOpacity
                          style={styles.bigPlayBtn}
                          onPress={handleStartVideo}
                        >
                          <Ionicons
                            name="play"
                            size={50}
                            color="#fff"
                            style={{ marginLeft: 5 }}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  <View style={styles.infoContent}>
                    <View style={styles.titleRow}>
                      <Text style={styles.popupTitle}>
                        {selectedActivity.titulo}
                      </Text>
                      <View style={styles.xpBadge}>
                        <Text style={styles.xpBadgeText}>
                          +{selectedActivity.recompensa_xp} XP
                        </Text>
                      </View>
                    </View>

                    {/* 🆕 ETIQUETA DE DIFICULTAD EN MODAL */}
                    <View style={{ flexDirection: "row", marginBottom: 10 }}>
                      <View
                        style={[
                          styles.diffBadge,
                          {
                            backgroundColor: getDiffColor(
                              selectedActivity.dificultad
                            ),
                          },
                        ]}
                      >
                        <Text style={styles.diffBadgeText}>
                          DIFICULTAD:{" "}
                          {selectedActivity.dificultad
                            ? selectedActivity.dificultad.toUpperCase()
                            : "FÁCIL"}
                        </Text>
                      </View>
                    </View>

                    {/* DESCRIPCIÓN */}
                    <ScrollView style={{ maxHeight: 100, marginBottom: 10 }}>
                      <Text style={styles.popupDesc}>
                        {selectedActivity.descripcion ||
                          "¡Mira el video y completa la misión!"}
                      </Text>
                    </ScrollView>

                    {isCompleted(selectedActivity._id) ? (
                      // CASO 1: YA COMPLETADA (Botón gris, solo cierra)
                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          {
                            backgroundColor: "#B0BEC5",
                            borderBottomColor: "#78909C",
                          },
                        ]}
                        onPress={handleCloseModal}
                      >
                        <Ionicons
                          name="repeat"
                          size={28}
                          color="#fff"
                          style={{ marginRight: 8 }}
                        />
                        <Text style={styles.btnText}>REPASAR LECCIÓN</Text>
                      </TouchableOpacity>
                    ) : (
                      // CASO 2: NO COMPLETADA (Botón Verde, da puntos)
                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          completing && { opacity: 0.8 },
                        ]}
                        onPress={handleComplete}
                        disabled={completing}
                      >
                        {completing ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <>
                            <Ionicons
                              name="checkmark-circle"
                              size={28}
                              color="#fff"
                              style={{ marginRight: 8 }}
                            />
                            <Text style={styles.btnText}>
                              ¡MISIÓN CUMPLIDA!
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { flex: 1, width: "100%", height: "100%" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.2)" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    marginTop: 10,
  },
  backBtn: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Nuevo contador de misiones
  missionCounter: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  missionText: { color: "#fff", fontWeight: "bold", fontSize: 14 },

  xpCapsule: {
    backgroundColor: "#44d150ff",
    paddingHorizontal: 15,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 5,
  },
  xpText: { fontWeight: "bold", color: "#E65100", fontSize: 16 },

  connector: {
    width: 6,
    backgroundColor: "rgba(255,255,255,0.6)",
    position: "absolute",
    bottom: -30,
    zIndex: -1,
    borderRadius: 3,
  },
  levelButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    borderBottomWidth: 8,
  },
  crown: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 3,
    elevation: 3,
  },
  levelLabel: {
    color: "#fff",
    fontWeight: "bold",
    marginTop: 5,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 3,
  },

  // Mini Badge en el camino
  miniDiffBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  miniDiffText: { color: "#fff", fontSize: 10, fontWeight: "bold" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  popupCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 25,
    overflow: "visible",
    elevation: 20,
    borderWidth: 5,
    borderColor: "#FFD54F",
  },
  closeBubble: {
    position: "absolute",
    top: -15,
    right: -15,
    backgroundColor: "#FF5252",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 5,
  },
  mediaFrame: {
    width: "100%",
    height: 200,
    backgroundColor: "#000",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  coverWrapper: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  coverImage: { width: "100%", height: "100%", opacity: 0.8 },
  bigPlayBtn: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  infoContent: { padding: 20 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  popupTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  xpBadge: {
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FFC107",
  },
  xpBadgeText: { color: "#FF8F00", fontWeight: "bold", fontSize: 14 },

  // Badge Grande en Modal
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  diffBadgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },

  popupDesc: { fontSize: 16, color: "#666", lineHeight: 22 },
  actionBtn: {
    backgroundColor: "#2E7D32",
    padding: 16,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    borderWidth: 0,
    marginTop: 10,
    borderBottomWidth: 5,
    borderBottomColor: "#1B5E20",
  },
  btnText: { color: "#fff", fontWeight: "900", fontSize: 18, letterSpacing: 1 },
});

export default ActivityScreen;
