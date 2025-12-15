import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MapScreen from "../screens/kids/MapScreen"; // La haremos ahora
import ActivityScreen from "../screens/kids/ActivityScreen"; // Próximo paso
import WinScreen from "../screens/kids/WinScreen"; // Próximo paso

const Stack = createStackNavigator();

const KidsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 1. El Mapa de Mundos */}
      <Stack.Screen name="Map" component={MapScreen} />

      {/* 2. La Actividad (Video) */}
      <Stack.Screen name="Activity" component={ActivityScreen} />

      {/* 3. Pantalla de Victoria */}
      <Stack.Screen name="Win" component={WinScreen} />
    </Stack.Navigator>
  );
};

export default KidsStack;
