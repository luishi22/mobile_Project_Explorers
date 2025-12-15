const express = require("express");
const router = express.Router();
const {
  createClassroom,
  findClassroomByCode,
  getMyClassrooms,
  updateClassroom,
  deleteClassroom,
} = require("../controllers/classController");
const protect = require("../middlewares/authMiddleware");

// Rutas protegidas (Necesitan Token)
router.post("/", protect, createClassroom); // Crear Aula
router.post("/join", protect, findClassroomByCode); // Unirse a Aula por Código
router.get("/my-classrooms", protect, getMyClassrooms); // Mis Aulas
router.put("/:id", protect, updateClassroom); // Editar
router.delete("/:id", protect, deleteClassroom); // Eliminar

module.exports = router;
