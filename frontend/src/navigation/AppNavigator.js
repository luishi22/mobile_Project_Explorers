import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { View, ActivityIndicator } from "react-native";

// Importamos los Stacks
import AuthStack from "./AuthStack";
import TeacherStack from "./TeacherStack";
import ParentStack from "./ParentStack";

const AppNavigator = () => {
  const { user, token, isLoading } = useContext(AuthContext);

  // 1. Pantalla de Carga (Splash)
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // 2. Lógica de Decisión
  return (
    <NavigationContainer>
      {/* Si NO hay token, mostramos Login/Registro */}
      {token === null ? (
        <AuthStack />
      ) : // Si SÍ hay token, preguntamos el Rol
      user?.rol === "maestro" ? (
        <TeacherStack /> // TeacherStack es el stack de las 3 pantallas del maestro
      ) : (
        <ParentStack />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
