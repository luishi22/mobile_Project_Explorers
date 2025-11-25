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
    type: String, // 'niño', 'niña' (para personalizar avatar si quieres)
  },
  padre_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  aula_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classroom",
    required: true, // ¡Vital! El niño debe pertenecer a un salón
  },
  progreso_xp: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Student", StudentSchema);
