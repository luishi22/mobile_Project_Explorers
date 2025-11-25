const express = require("express");
const router = express.Router();
const {
  createWorld,
  addActivityToWorld,
  getWorldsByClassroom,
  createPost,
  getPostsByClassroom,
} = require("../controllers/contentController");
const protect = require("../middlewares/authMiddleware");

// Todas estas rutas requieren estar logueado (protect)

// --- Mundos y Actividades ---
router.post("/worlds", protect, createWorld); // Crear Mundo
router.post("/worlds/:id/activity", protect, addActivityToWorld); // Agregar Actividad
router.get("/worlds/classroom/:aula_id", protect, getWorldsByClassroom); // Ver Mundos

// --- Posts (Noticias) ---
router.post("/posts", protect, createPost); // Crear Noticia
router.get("/posts/classroom/:aula_id", protect, getPostsByClassroom); // Ver Noticias

module.exports = router;
