const express = require("express");
const router = express.Router();
const {
  createClassroom,
  findClassroomByCode,
} = require("../controllers/classController");
const protect = require("../middlewares/authMiddleware");

// Rutas protegidas (Necesitan Token)
router.post("/", protect, createClassroom);
router.post("/join", protect, findClassroomByCode);

module.exports = router;
