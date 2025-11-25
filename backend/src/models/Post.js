const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
  },
  contenido: {
    type: String,
    required: true, // El texto del consejo o aviso
  },
  tipo: {
    type: String,
    enum: ["aviso", "tip", "tarea", "dato_curioso"],
    default: "aviso",
  },
  imagen_url: String, // Opcional (Foto o PDF subido a Cloudinary)
  link_externo: String, // Opcional (Si quieres poner un link a una web externa)

  // LA CLAVE: Solo los padres de esta aula verán este post
  aula_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classroom",
    required: true,
  },
  // Saber qué profesor lo escribió (útil si hay auxiliares)
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
