const express = require("express");
const router = express.Router();
const {
  createStudent,
  getMyChildren,
  markActivityComplete,
  updateStudent,
  deleteStudent,
  getStudentsByClassroom,
} = require("../controllers/studentController");
const protect = require("../middlewares/authMiddleware");

// Todas las rutas están protegidas por el Token

// --- GESTIÓN BÁSICA (PADRES) ---
router.post("/", protect, createStudent); // Crear nuevo hijo
router.get("/my-children", protect, getMyChildren); // Ver mis hijos

// --- PROGRESO Y GAMIFICACIÓN ---
router.post("/:studentId/complete", protect, markActivityComplete); // Marcar tarea y sumar XP

// --- GESTIÓN AVANZADA (EDITAR / BORRAR) ---
router.put("/:id", protect, updateStudent); // Editar datos del niño
router.delete("/:id", protect, deleteStudent); // Borrar niño (y sacarlo del aula)

// --- VISTA DEL MAESTRO ---
router.get("/classroom/:aulaId", protect, getStudentsByClassroom); // Ver lista de alumnos y ranking

module.exports = router;
