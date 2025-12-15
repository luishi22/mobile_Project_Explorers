import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ParentHomeScreen from "../screens/parents/ParentHomeScreen";
import JoinClassScreen from "../screens/parents/JoinClassScreen"; // La haremos pronto
import CreateChildScreen from "../screens/parents/CreateChildScreen"; // La haremos pronto
import ProfileScreen from "../screens/shared/ProfileScreen"; // Reutilizamos la de perfil

// Importaremos las pantallas del Modo Niño luego
import KidsStack from "./KidStack";

const Stack = createStackNavigator();

const ParentStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#FF8F00" }, // Naranja para Padres
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
        headerBackTitleVisible: false,
      }}
    >
      {/* 1. Home del Padre (Noticias y Acceso a Modo Niño) */}
      <Stack.Screen
        name="ParentHome"
        component={ParentHomeScreen}
        options={{ headerShown: false }}
      />

      {/* 2. Unirse a una Clase (Si es nuevo) */}
      <Stack.Screen
        name="JoinClass"
        component={JoinClassScreen}
        options={{ title: "Unirse a un Aula" }}
      />

      {/* 3. Registrar al Hijo */}
      <Stack.Screen
        name="CreateChild"
        component={CreateChildScreen}
        options={{ title: "Perfil del Explorador" }}
      />

      {/* 4. Perfil del Padre (Reutilizado) */}
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Mi Perfil" }}
      />

      {/* 5. MODO NIÑO (Entra a otro mundo) */}
      <Stack.Screen
        name="KidsMode"
        component={KidsStack}
        options={{ headerShown: false }} // ¡Importante! Ocultar header del padre también
      />
    </Stack.Navigator>
  );
};

export default ParentStack;
