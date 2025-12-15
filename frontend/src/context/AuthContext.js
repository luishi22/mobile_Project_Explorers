import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const storedToken = await AsyncStorage.getItem("token");
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } catch (error) {
        console.log("Error cargando datos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStorageData();
  }, []);

  // LOGIN CON VALIDACIÓN DE ERRORES 🛡️
  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, ...userData } = response.data;

      setToken(token);
      setUser(userData);
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      console.log("Login Error:", error.response); // Para que tú lo veas en consola

      // Aquí extraemos el mensaje exacto del backend
      let msg = "Hubo un error de conexión";
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        msg = error.response.data.message; // Ej: "Email o contraseña inválidos"
      }

      return { success: false, msg };
    }
  };

  // REGISTRO CON VALIDACIÓN DE ERRORES 🛡️
  const register = async (nombre, email, password, rol) => {
    try {
      const response = await api.post("/auth/register", {
        nombre,
        email,
        password,
        rol,
      });
      const { token, ...userData } = response.data;

      setToken(token);
      setUser(userData);
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      let msg = "Error al registrarse";
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        msg = error.response.data.message; // Ej: "El usuario ya existe"
      }
      return { success: false, msg };
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
  };

  const updateUser = async (newUserData) => {
    // 1. Actualizamos el estado de React (para que se vea al instante)
    // Mantenemos el token viejo si el nuevo objeto no trae uno, o usamos el nuevo
    const updatedUser = { ...user, ...newUserData };

    setUser(updatedUser);

    // 2. Actualizamos la memoria física (para que persista al cerrar app)
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

    // Si la respuesta trajo un token nuevo, lo actualizamos también
    if (newUserData.token) {
      setToken(newUserData.token);
      await AsyncStorage.setItem("token", newUserData.token);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
