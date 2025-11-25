const mongoose = require("mongoose");

// Sub-esquema para las Actividades (No se guarda en una colección aparte, vive dentro del Mundo)
const ActivitySchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: String,
  video_url: { type: String, required: true }, // Link de YouTube
  imagen_preview: String, // Link de la miniatura (Cloudinary)
  recompensa_xp: { type: Number, default: 10 }, // Puntos que gana el niño
  orden: { type: Number, default: 0 }, // Para saber cuál va primero (1, 2, 3...)
});

const WorldSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true, // Ej: "Mundo Selva"
  },
  descripcion: String,
  imagen_portada: {
    type: String,
    required: true, // Link de Cloudinary
  },
  nivel_dificultad: {
    type: String,
    enum: ["facil", "medio", "dificil"],
    default: "facil",
  },
  // 🔐 LA CLAVE: Este mundo pertenece a un Aula específica
  aula_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classroom",
    required: true,
  },
  // Aquí guardamos las clases/niveles de este mundo
  actividades: [ActivitySchema],

  fecha_creacion: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("World", WorldSchema);
