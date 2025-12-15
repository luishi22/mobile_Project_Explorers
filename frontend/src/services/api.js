import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // <--- Importamos esto

// ⚠️ REVISA QUE TU IP SIGA SIENDO ESTA (A veces el router la cambia)
const PROD_URL = "http://192.168.1.9:3000/api";

const BASE_URL =
  Platform.OS === "android" ? PROD_URL : "http://localhost:3000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔥 LA MAGIA: Interceptor de Solicitudes
// Esto se ejecuta AUTOMÁTICAMENTE antes de cada petición (GET, POST, etc.)
api.interceptors.request.use(
  async (config) => {
    // 1. Buscamos el token en la memoria física del celular
    const token = await AsyncStorage.getItem("token");

    // 2. Si existe, lo pegamos en la cabecera
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
