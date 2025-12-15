const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  rol: {
    type: String,
    enum: ["maestro", "padre"],
    default: "padre",
  },
  // 👇 NUEVO CAMPO AGREGADO
  foto_perfil: {
    type: String,
    default: "https://cdn-icons-png.flaticon.com/512/847/847969.png", // Avatar genérico por defecto
  },
  // 👆 FIN NUEVO CAMPO
  fecha_registro: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);
