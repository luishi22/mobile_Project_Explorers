const express = require("express");
const router = express.Router();
const {
  createClassroom,
  findClassroomByCode,
  getMyClassrooms,
} = require("../controllers/classController");
const protect = require("../middlewares/authMiddleware");

// Rutas protegidas (Necesitan Token)
router.post("/", protect, createClassroom);
router.post("/join", protect, findClassroomByCode);
router.get("/my-classrooms", protect, getMyClassrooms);

module.exports = router;
