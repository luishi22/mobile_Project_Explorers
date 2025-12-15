const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  updateProfile,
  deleteUser,
} = require("../controllers/authController");

const protect = require("../middlewares/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);

// --- Rutas de Perfil ---
router.put("/profile", protect, updateProfile); // Editar mis datos
router.delete("/profile", protect, deleteUser); // Borrar mi cuenta

module.exports = router;
