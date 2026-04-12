const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  updateProfile,
  deleteUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const protect = require("../middlewares/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);

// --- Rutas de Perfil ---
router.put("/profile", protect, updateProfile); // Editar mis datos
router.delete("/profile", protect, deleteUser); // Borrar mi cuenta

router.post("/forgotpassword", forgotPassword); // Ruta para solicitar el PIN de recuperación
router.post("/resetpassword", resetPassword); // Ruta para restablecer la contraseña usando el PIN

module.exports = router;
