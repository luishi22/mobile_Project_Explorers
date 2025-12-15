import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ImageBackground,
  ActivityIndicator,
  Dimensions,
  BackHandler,
  Animated,
  Easing,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const MapScreen = ({ route, navigation }) => {
  const [currentChild, setCurrentChild] = useState(route.params?.child);
  const [worlds, setWorlds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados Salida
  const [isExitActive, setIsExitActive] = useState(false);
  const [exitCount, setExitCount] = useState(3);

  const exitTimer = useRef(null);
  const intervalRef = useRef(null);
  const exitProgress = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Bloqueo botón físico
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true;
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => subscription.remove();
    }, [])
  );

  // Recargar Datos
  useFocusEffect(
    useCallback(() => {
      const reloadData = async () => {
        try {
          const resChildren = await api.get("/students/my-children");
          const freshChild = resChildren.data.find(
            (c) => c._id === route.params.child._id
          );

          if (freshChild) {
            setCurrentChild(freshChild);
            if (freshChild.aula_id) {
              const aulaId = freshChild.aula_id._id || freshChild.aula_id;
              const resWorlds = await api.get(
                `/content/worlds/classroom/${aulaId}`
              );
              setWorlds(resWorlds.data);
            }
          }
        } catch (error) {
          console.log("Error recargando:", error);
        } finally {
          setLoading(false);
        }
      };
      reloadData();
    }, [])
  );

  // --- LÓGICA BOTÓN SALIR ---
  const startExitTimer = () => {
    setIsExitActive(true);
    setExitCount(3);
    Animated.parallel([
      Animated.timing(exitProgress, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
      Animated.spring(buttonScale, {
        toValue: 1.25,
        friction: 3,
        useNativeDriver: false,
      }),
    ]).start();

    intervalRef.current = setInterval(() => {
      setExitCount((prev) => (prev <= 1 ? 1 : prev - 1));
    }, 1000);

    exitTimer.current = setTimeout(() => {
      navigation.goBack();
    }, 3000);
  };

  const cancelExitTimer = () => {
    setIsExitActive(false);
    clearTimeout(exitTimer.current);
    clearInterval(intervalRef.current);
    exitProgress.stopAnimation();
    exitProgress.setValue(0);
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: false,
    }).start();
    setExitCount(3);
  };

  const exitBtnColor = exitProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(0,0,0,0.4)", "rgba(211, 47, 47, 1)"],
  });

  const renderWorld = ({ item }) => (
    <TouchableOpacity
      style={styles.islandContainer}
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate("Activity", {
          worldId: item._id,
          child: currentChild,
          bgImage: item.imagen_portada,
        })
      }
    >
      <ImageBackground
        source={{ uri: item.imagen_portada }}
        style={styles.islandImage}
        imageStyle={{ borderRadius: 25 }}
      >
        <View style={styles.islandOverlay}>
          <View style={styles.textContainer}>
            <Text style={styles.islandTitle}>{item.nombre}</Text>

            {/* Descripción */}
            {item.descripcion ? (
              <Text style={styles.islandDesc} numberOfLines={2}>
                {item.descripcion}
              </Text>
            ) : null}

            {/* 👇 CONTADOR DE NIVELES AGREGADO */}
            <Text style={styles.islandCount}>
              🏁 {item.actividades ? item.actividades.length : 0} Niveles
            </Text>
          </View>
          <View style={styles.playButton}>
            <Ionicons name="play" size={30} color="#fff" />
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  if (!currentChild)
    return <View style={{ flex: 1, backgroundColor: "#000" }} />;

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <ImageBackground
        source={{
          uri: "https://i.pinimg.com/736x/94/b5/37/94b5372c8f478461cd2e901e0e3f2785.jpg",
        }}
        style={styles.bg}
      >
        <View style={styles.header}>
          <View style={{ alignItems: "center" }}>
            <TouchableOpacity
              activeOpacity={1}
              onPressIn={startExitTimer}
              onPressOut={cancelExitTimer}
              style={styles.exitWrapper}
            >
              <Animated.View
                style={[
                  styles.backBtnAnimated,
                  {
                    backgroundColor: exitBtnColor,
                    transform: [{ scale: buttonScale }],
                  },
                ]}
              >
                <Ionicons name="arrow-back" size={32} color="#fff" />
              </Animated.View>
            </TouchableOpacity>
            {isExitActive && <Text style={styles.holdText}>Salir</Text>}
          </View>

          <View style={styles.profileBadge}>
            <Image
              source={{
                uri:
                  currentChild.genero === "niña"
                    ? "https://cdn-icons-png.flaticon.com/512/4509/4509555.png"
                    : "https://cdn-icons-png.flaticon.com/512/9136/9136628.png",
              }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.childName}>{currentChild.nombre}</Text>
              <Text style={styles.xpText}>
                ⭐ {currentChild.progreso_xp || 0} XP
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.title}>¡Elige una Aventura!</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <FlatList
            data={worlds}
            keyExtractor={(item) => item._id}
            renderItem={renderWorld}
            contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No hay aventuras 😢</Text>
              </View>
            }
          />
        )}

        {isExitActive && (
          <View style={styles.exitOverlay}>
            <View style={styles.countdownCircle}>
              <Text style={styles.countdownText}>{exitCount}</Text>
            </View>
            <Text style={styles.overlayTitle}>Saliendo...</Text>
            <Text style={styles.overlaySubtitle}>Suelta para cancelar</Text>
          </View>
        )}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { flex: 1, width: "100%", height: "100%" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    marginTop: 20,
    alignItems: "flex-start",
  },
  exitWrapper: { alignItems: "center", width: 70 },
  backBtnAnimated: {
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    elevation: 8,
  },
  holdText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 5,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 2,
  },
  profileBadge: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 5,
    paddingRight: 15,
    borderRadius: 30,
    alignItems: "center",
    elevation: 5,
  },
  avatar: { width: 40, height: 40, marginRight: 10 },
  childName: { fontWeight: "bold", color: "#333", fontSize: 16 },
  xpText: { color: "#F57C00", fontWeight: "bold", fontSize: 14 },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 5,
  },
  islandContainer: {
    height: 200,
    marginBottom: 20,
    borderRadius: 25,
    elevation: 8,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  islandImage: { flex: 1, justifyContent: "flex-end" },

  // Overlay mejorado
  islandOverlay: {
    height: "auto",
    minHeight: "40%",
    backgroundColor: "rgba(0,0,0,0.7)", // Un poco más oscuro para leer bien
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContainer: { flex: 1, marginRight: 10 },
  islandTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 2,
  },
  islandDesc: {
    color: "#ddd",
    fontSize: 13,
    lineHeight: 18,
  },
  // Estilo del contador
  islandCount: {
    color: "#FFD54F", // Amarillo dorado
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 5,
  },

  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FF8F00",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  emptyBox: {
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 20,
    borderRadius: 15,
    marginTop: 50,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },
  exitOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  countdownCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 5,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  countdownText: { color: "#fff", fontSize: 50, fontWeight: "bold" },
  overlayTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  overlaySubtitle: { color: "#ccc", fontSize: 16 },
});

export default MapScreen;
