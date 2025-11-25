const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  edad: {
    type: Number,
    required: true,
  },
  genero: {
    type: String, // 'niño', 'niña' (para personalizar avatar)
  },
  padre_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  aula_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classroom",
    required: true, // El niño debe pertenecer a un salón
  },
  progreso_xp: {
    type: Number,
    default: 0,
  },
  actividades_completadas: [
    {
      actividad_id: { type: String, required: true }, // El ID único de la actividad
      mundo_id: { type: String, required: true }, // Para saber de qué mundo es
      fecha: { type: Date, default: Date.now }, // Cuándo la terminó
    },
  ],
});

module.exports = mongoose.model("Student", StudentSchema);
