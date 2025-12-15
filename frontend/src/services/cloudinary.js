import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Alert } from "react-native";

// TUS DATOS
const CLOUD_NAME = "du7ywq0k1";
const UPLOAD_PRESET = "exploradores";

const URL_IMAGE = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
const URL_RAW = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`;

export const pickImage = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permiso denegado", "Necesitamos acceso a la galería.");
    return null;
  }
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.5,
    base64: true,
  });
  if (!result.canceled) {
    return {
      uri: result.assets[0].uri,
      type: "image",
      name: result.assets[0].uri.split("/").pop(),
    };
  }
  return null;
};

export const pickDocument = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      // El filtro visual ayuda, pero no es infalible en todos los Androids
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain",
        "image/*",
      ],
      copyToCacheDirectory: true,
    });

    if (result.canceled) return null;
    const asset = result.assets ? result.assets[0] : result;

    // 🔒 ZONA DE SEGURIDAD (VALIDACIÓN MANUAL) 🔒
    const mime = asset.mimeType || "";
    const name = asset.name.toLowerCase();

    // Lista negra de extensiones y tipos
    if (
      mime.startsWith("video/") ||
      name.endsWith(".mp4") ||
      name.endsWith(".mov") ||
      name.endsWith(".avi") ||
      mime.startsWith("audio/") ||
      name.endsWith(".mp3") ||
      name.endsWith(".wav") ||
      name.endsWith(".zip") ||
      name.endsWith(".rar") ||
      name.endsWith(".apk")
    ) {
      Alert.alert(
        "Archivo no permitido",
        "Por favor sube solo Documentos (PDF, Office) o Imágenes."
      );
      return null; // ¡RECHAZADO! No retornamos nada.
    }

    // Si pasó el filtro, procesamos
    const cleanName = asset.name
      ? asset.name.replace(/[^a-zA-Z0-9.]/g, "_")
      : "documento.pdf";

    return { uri: asset.uri, type: "raw", name: cleanName };
  } catch (err) {
    return null;
  }
};

export const uploadToCloudinary = async (fileObj) => {
  if (!fileObj || !fileObj.uri) return null;

  let uploadUrl = URL_IMAGE;
  let mimeType = "image/jpeg";

  // Detectar RAW/PDF
  if (fileObj.type === "raw" || fileObj.uri.endsWith(".pdf")) {
    uploadUrl = URL_RAW;
    mimeType = fileObj.uri.endsWith(".pdf")
      ? "application/pdf"
      : "application/octet-stream";
  }

  const formData = new FormData();
  formData.append("file", {
    uri: fileObj.uri,
    name: fileObj.name,
    type: mimeType,
  });
  formData.append("upload_preset", UPLOAD_PRESET);

  console.log("Subiendo a:", uploadUrl);

  try {
    const response = await fetch(uploadUrl, { method: "POST", body: formData });
    const data = await response.json();

    if (data.secure_url) {
      return data.secure_url;
    } else {
      console.log("Error Cloudinary:", data);
      Alert.alert("Error", "No se pudo subir.");
      return null;
    }
  } catch (error) {
    Alert.alert("Error", "Falló la conexión.");
    return null;
  }
};
