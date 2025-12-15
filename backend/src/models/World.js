const mongoose = require("mongoose");

// 1. AHORA LA DIFICULTAD VIVE AQUÍ
const ActivitySchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: String,
  video_url: { type: String, required: true },
  imagen_preview: String,
  recompensa_xp: { type: Number, default: 10 },

  dificultad: {
    type: String,
    enum: ["facil", "medio", "dificil"],
    default: "facil",
  },

  orden: { type: Number, default: 0 },
});

const WorldSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: String,
  imagen_portada: { type: String, required: true },

  aula_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classroom",
    required: true,
  },
  actividades: [ActivitySchema],
  fecha_creacion: { type: Date, default: Date.now },
});

module.exports = mongoose.model("World", WorldSchema);
