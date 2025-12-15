const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  contenido: { type: String, required: true },
  tipo: {
    type: String,
    enum: ["aviso", "tip", "tarea", "dato_curioso"],
    default: "aviso",
  },

  // Array de objetos
  adjuntos: [
    {
      url: { type: String, required: true },
      tipo: { type: String, enum: ["image", "file"], default: "image" }, // Saber si es foto o doc
      nombre: String, // Nombre del archivo para mostrarlo
    },
  ],

  aula_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classroom",
    required: true,
  },
  autor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  fecha_publicacion: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", PostSchema);
