const Classroom = require("../models/Classroom");
const User = require("../models/User");

// Función auxiliar para generar código aleatorio (Ej: K8J2X1)
const generateCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// @desc    Crear Aula (Solo Maestros)
// @route   POST /api/classrooms
const createClassroom = async (req, res) => {
  try {
    // Verificar que sea maestro (Usando el middleware)
    if (req.user.rol !== "maestro") {
      return res
        .status(403)
        .json({ message: "Solo los maestros pueden crear aulas" });
    }

    const { nombre } = req.body;

    // Generar código único
    let codigo = generateCode();
    // (En producción haríamos un loop para asegurar que no se repita, por ahora sirve)

    const classroom = await Classroom.create({
      nombre,
      codigo_acceso: codigo,
      maestro_id: req.user.id,
    });

    res.status(201).json(classroom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Buscar Aula por Código (Para que el padre la encuentre)
// @route   POST /api/classrooms/join
const findClassroomByCode = async (req, res) => {
  try {
    const { codigo } = req.body;

    const classroom = await Classroom.findOne({ codigo_acceso: codigo });

    if (!classroom) {
      return res.status(404).json({ message: "Código de aula no válido" });
    }

    // Retornamos la info del aula para que el frontend confirme
    res.json({
      _id: classroom._id,
      nombre: classroom.nombre,
      maestro_id: classroom.maestro_id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createClassroom, findClassroomByCode };
