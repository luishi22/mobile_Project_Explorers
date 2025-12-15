const User = require("../models/User");
const Classroom = require("../models/Classroom");
const Student = require("../models/Student");
const World = require("../models/World");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id, rol) => {
  return jwt.sign({ id, rol }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Registrar nuevo usuario
const registerUser = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      nombre,
      email,
      password: hashedPassword,
      rol,
      // No hace falta pasar foto_perfil, tomará el 'default' del modelo
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        foto_perfil: user.foto_perfil, // 👈 AGREGAR ESTO (Devuelve la default)
        token: generateToken(user.id, user.rol),
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login de usuario
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        foto_perfil: user.foto_perfil, // 👈 AGREGAR ESTO (Para que la App sepa qué foto mostrar)
        token: generateToken(user.id, user.rol),
      });
    } else {
      res.status(401).json({ message: "Email o contraseña inválidos" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Actualizar Mi Perfil
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Actualizamos datos básicos
    user.nombre = req.body.nombre || user.nombre;
    user.email = req.body.email || user.email;

    // 👇 AQUÍ RECIBIMOS EL LINK DE CLOUDINARY
    // Si el frontend manda una foto nueva, la guardamos. Si no, dejamos la vieja.
    user.foto_perfil = req.body.foto_perfil || user.foto_perfil;

    // Actualizar password si lo envían
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      nombre: updatedUser.nombre,
      email: updatedUser.email,
      rol: updatedUser.rol,
      foto_perfil: updatedUser.foto_perfil, // 👈 DEVOLVER LA FOTO ACTUALIZADA
      token: generateToken(updatedUser._id, updatedUser.rol),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// El deleteUser NO necesita cambios, ya que al borrar el usuario se borra su campo foto_perfil de la BD.
// (La imagen se quedará en Cloudinary, pero para efectos de tesis está bien no complicar el borrado remoto).

const deleteUser = async (req, res) => {
  // ... (Tu código actual de deleteUser está perfecto, déjalo igual)
  // Solo copio el inicio para referencia
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    // ... Logica de borrado en cascada ...
    if (user.rol === "maestro") {
      const aulas = await Classroom.find({ maestro_id: userId });
      const aulasIds = aulas.map((a) => a._id);
      await World.deleteMany({ aula_id: { $in: aulasIds } });
      await Student.updateMany(
        { aula_id: { $in: aulasIds } },
        { $unset: { aula_id: "" } }
      );
      await Classroom.deleteMany({ maestro_id: userId });
    } else if (user.rol === "padre") {
      const hijos = await Student.find({ padre_id: userId });
      const hijosIds = hijos.map((h) => h._id);
      await Classroom.updateMany(
        { alumnos: { $in: hijosIds } },
        { $pull: { alumnos: { $in: hijosIds } } }
      );
      await Student.deleteMany({ padre_id: userId });
    }
    await User.findByIdAndDelete(userId);
    res.json({ message: "Cuenta eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateProfile,
  deleteUser,
};
