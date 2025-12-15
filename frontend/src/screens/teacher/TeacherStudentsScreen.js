import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";
import { useFocusEffect } from "@react-navigation/native";

// 👇 IMPORTACIONES PARA PDF
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const TeacherStudentsScreen = ({ route }) => {
  const { aulaId } = route.params;
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estado para el botón de imprimir
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const fetchStudents = async () => {
    try {
      // ✅ USAMOS LA URL QUE SÍ FUNCIONA EN TU BACKEND
      const response = await api.get(`/students/classroom/${aulaId}`);

      // Ordenamos por XP de mayor a menor para el ranking
      const sortedStudents = response.data.sort(
        (a, b) => b.progreso_xp - a.progreso_xp
      );
      setStudents(sortedStudents);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStudents();
    }, [])
  );

  // 👇 LÓGICA DE PDF INTEGRADA
  const handleExportPDF = async () => {
    if (students.length === 0) {
      Alert.alert("Aviso", "No hay estudiantes para generar el reporte.");
      return;
    }

    setGeneratingPdf(true);

    try {
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 20px; }
              h1 { color: #2E7D32; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #2E7D32; color: white; }
              tr:nth-child(even) { background-color: #f2f2f2; }
              .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <h1>Ranking de Clase - PEQUEMOV</h1>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Total Estudiantes:</strong> ${students.length}</p>
            
            <table>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Edad</th>
                <th>Tareas</th>
                <th>Puntos (XP)</th>
              </tr>
              ${students
                .map(
                  (s, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${s.nombre}</td>
                  <td>${s.edad} años</td>
                  <td>${
                    s.actividades_completadas
                      ? s.actividades_completadas.length
                      : 0
                  }</td>
                  <td><strong>${s.progreso_xp} XP</strong></td>
                </tr>
              `
                )
                .join("")}
            </table>

            <div class="footer">
              Ranking generado por PEQUEMOV App
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert("Error", "No se pudo generar el PDF");
      console.error(error);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const renderStudent = ({ item, index }) => {
    // Top 3 tienen medallas
    let medalColor = null;
    if (index === 0) medalColor = "#FFD700"; // Oro
    else if (index === 1) medalColor = "#C0C0C0"; // Plata
    else if (index === 2) medalColor = "#CD7F32"; // Bronce

    return (
      <View style={styles.card}>
        {/* Avatar y Ranking */}
        <View style={styles.avatarContainer}>
          <View
            style={[
              styles.avatarPlaceholder,
              {
                backgroundColor: item.genero === "niña" ? "#F48FB1" : "#90CAF9",
              },
            ]}
          >
            <Ionicons name="person" size={24} color="#fff" />
          </View>
          {medalColor && (
            <View style={styles.medal}>
              <Ionicons name="ribbon" size={20} color={medalColor} />
            </View>
          )}
        </View>

        {/* Datos */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{item.nombre}</Text>
          <Text style={styles.details}>{item.edad} años</Text>

          {/* Barra de Progreso Visual */}
          <View style={styles.xpContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.xpText}>{item.progreso_xp} XP</Text>
          </View>
        </View>

        {/* Tareas Completadas */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsNumber}>
            {item.actividades_completadas
              ? item.actividades_completadas.length
              : 0}
          </Text>
          <Text style={styles.statsLabel}>Tareas</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER MEJORADO CON BOTÓN PDF */}
      <View style={styles.headerInfo}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text style={styles.headerTitle}>Ranking de Clase 🏆</Text>
            <Text style={styles.headerSubtitle}>
              Basado en puntos de experiencia (XP)
            </Text>
          </View>

          {/* BOTÓN IMPRIMIR */}
          <TouchableOpacity
            style={styles.pdfButton}
            onPress={handleExportPDF}
            disabled={generatingPdf}
          >
            {generatingPdf ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="print-outline" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2E7D32"
          style={{ marginTop: 30 }}
        />
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item._id}
          renderItem={renderStudent}
          contentContainerStyle={{ padding: 15 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchStudents} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="school-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>
                No hay estudiantes inscritos aún.
              </Text>
              <Text style={styles.emptySub}>
                Comparte el código del aula con los padres.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  headerInfo: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#2E7D32" },
  headerSubtitle: { fontSize: 14, color: "#666" },

  // Estilo nuevo para botón PDF
  pdfButton: {
    backgroundColor: "#2E7D32",
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
    elevation: 2,
  },

  avatarContainer: { position: "relative", marginRight: 15 },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  medal: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 2,
    elevation: 2,
  },

  infoContainer: { flex: 1 },
  name: { fontSize: 16, fontWeight: "bold", color: "#333" },
  details: { fontSize: 12, color: "#888", marginBottom: 5 },

  xpContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  xpText: { fontSize: 12, fontWeight: "bold", color: "#F57F17", marginLeft: 4 },

  statsContainer: {
    alignItems: "center",
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: "#eee",
  },
  statsNumber: { fontSize: 18, fontWeight: "bold", color: "#333" },
  statsLabel: { fontSize: 10, color: "#666" },

  emptyContainer: { alignItems: "center", marginTop: 50 },
  emptyText: { fontSize: 16, fontWeight: "bold", color: "#666", marginTop: 10 },
  emptySub: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});

export default TeacherStudentsScreen;
