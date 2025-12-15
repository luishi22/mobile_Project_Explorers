const express = require("express");
const router = express.Router();
const {
  // Mundos
  createWorld,
  getWorldsByClassroom,
  getWorldById,
  updateWorld,
  deleteWorld,

  // Actividades
  addActivityToWorld,
  updateActivity,
  deleteActivity,

  // Posts (Noticias)
  createPost,
  getPostsByClassroom,
  updatePost,
  deletePost,
} = require("../controllers/contentController");
const protect = require("../middlewares/authMiddleware");

// ================= MUNDOS =================
router.post("/worlds", protect, createWorld);
router.get("/worlds/classroom/:aula_id", protect, getWorldsByClassroom); // Listar todos
router.get("/worlds/:id", protect, getWorldById); // Ver uno específico (y sus actividades)
router.put("/worlds/:id", protect, updateWorld);
router.delete("/worlds/:id", protect, deleteWorld);

// ================= ACTIVIDADES =================
router.post("/worlds/:id/activity", protect, addActivityToWorld);
router.put("/worlds/:worldId/activity/:activityId", protect, updateActivity);
router.delete("/worlds/:worldId/activity/:activityId", protect, deleteActivity);

// ================= POSTS (NOTICIAS) =================
router.post("/posts", protect, createPost);
router.get("/posts/classroom/:aula_id", protect, getPostsByClassroom);
router.put("/posts/:id", protect, updatePost);
router.delete("/posts/:id", protect, deletePost);

module.exports = router;
