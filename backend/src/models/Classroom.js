const mongoose = require("mongoose");

const ClassroomSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true, // Ej: "Kinder A - Mañana"
  },
  codigo_acceso: {
    type: String,
    required: true,
    unique: true, // Ej: "PROFE-JUAN"
  },
  maestro_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Lista de alumnos inscritos en esta aula
  alumnos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  fecha_creacion: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Classroom", ClassroomSchema);
