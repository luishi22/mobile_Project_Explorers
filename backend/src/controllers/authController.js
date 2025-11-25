const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generar Token JWT
const generateToken = (id, rol) => {
  return jwt.sign({ id, rol }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Registrar nuevo usuario (Maestro o Padre)
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Verificar si ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario
    const user = await User.create({
      nombre,
      email,
      password: hashedPassword,
      rol, // 'maestro' o 'padre'
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        token: generateToken(user.id, user.rol),
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login de usuario
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ email });

    // Verificar password
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        token: generateToken(user.id, user.rol),
      });
    } else {
      res.status(401).json({ message: "Email o contraseña inválidos" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };
