import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, Animated } from "react-native";
import { StatusBar } from "expo-status-bar";

const WinScreen = ({ route, navigation }) => {
  const { xp } = route.params;
  const scaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de entrada
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Regresar al mapa después de 3 segundos
    const timer = setTimeout(() => {
      // ⚠️ CORRECCIÓN CRÍTICA:
      // popToTop() elimina todas las pantallas de encima y regresa a la primera del Stack (El Mapa).
      // Esto evita el bucle infinito y obliga al Mapa a ver que recuperó el foco.
      navigation.popToTop();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Image
        source={{
          uri: "https://i.pinimg.com/736x/50/d5/fd/50d5fd3193325eea6ef2dd5c1b26941c.jpg",
        }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <Animated.View
        style={[styles.content, { transform: [{ scale: scaleValue }] }]}
      >
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/3112/3112946.png",
          }}
          style={styles.trophy}
        />
        <Text style={styles.title}>¡EXCELENTE!</Text>
        <Text style={styles.subtitle}>Completaste la misión</Text>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>+{xp} XP</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFD700",
  },
  content: { alignItems: "center", padding: 20 },
  trophy: { width: 200, height: 200, marginBottom: 20 },
  title: {
    fontSize: 40,
    fontWeight: "900",
    color: "#E65100",
    textShadowColor: "rgba(255,255,255,0.5)",
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 20,
    color: "#333",
    fontWeight: "bold",
    marginBottom: 20,
  },
  xpBadge: {
    backgroundColor: "#2E7D32",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 5,
  },
  xpText: { color: "#fff", fontSize: 30, fontWeight: "bold" },
});

export default WinScreen;
