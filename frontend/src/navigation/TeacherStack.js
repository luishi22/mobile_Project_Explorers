import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import TeacherHomeScreen from "../screens/teacher/TeacherHomeScreen";
import TeacherClassScreen from "../screens/teacher/TeacherClassScreen"; // La crearemos en el Paso 2
import ManageWorldScreen from "../screens/teacher/ManageWorldScreen"; // La crearemos en el Paso 3
import TeacherPostsScreen from "../screens/teacher/TeacherPostsScreen";
import TeacherStudentsScreen from "../screens/teacher/TeacherStudentsScreen";
import ProfileScreen from "../screens/shared/ProfileScreen";

const Stack = createStackNavigator();

const TeacherStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#2E7D32" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
        headerBackTitleVisible: false, // Ocultar texto "Atrás" en iOS
      }}
    >
      {/* Pantalla 1: Lista de Aulas (Home) */}
      <Stack.Screen
        name="TeacherHome"
        component={TeacherHomeScreen}
        options={{ headerShown: false }} // El Home ya tiene su propio Header personalizado
      />

      {/* Pantalla 2: Dentro del Aula (Ver Mundos) */}
      <Stack.Screen
        name="TeacherClass"
        component={TeacherClassScreen}
        options={({ route }) => ({ title: route.params.nombreAula })}
      />

      {/* Pantalla 3: Dentro del Mundo (Ver Actividades) */}
      <Stack.Screen
        name="ManageWorld"
        component={ManageWorldScreen}
        options={({ route }) => ({ title: route.params.nombreMundo })}
      />

      <Stack.Screen
        name="TeacherPosts"
        component={TeacherPostsScreen}
        options={({ route }) => ({
          title: `Noticias: ${route.params.nombreAula}`,
        })}
      />
      <Stack.Screen
        name="TeacherStudents"
        component={TeacherStudentsScreen}
        options={{ title: "Estudiantes" }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Mi Perfil" }}
      />
    </Stack.Navigator>
  );
};

export default TeacherStack;
