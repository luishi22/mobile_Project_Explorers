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
    let codigo;
    let existe = true;

    while (existe) {
      codigo = generateCode(); // Generar codigo
      // Busca si alguien lo tiene
      const aulaConEseCodigo = await Classroom.findOne({
        codigo_acceso: codigo,
      });

      if (!aulaConEseCodigo) {
        existe = false; // Si nadie lo tiene, se rompe el ciclo
      }
    }

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

// @desc    Obtener MIS aulas (Solo para el Maestro)
// @route   GET /api/classrooms/my-classrooms
const getMyClassrooms = async (req, res) => {
  try {
    if (req.user.rol !== "maestro") {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    // lista de aulas del maestro con sus estudiantes
    const classrooms = await Classroom.find({
      maestro_id: req.user.id,
    }).populate(
      "alumnos",
      "nombre edad genero progreso_xp actividades_completadas"
    );

    res.json(classrooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createClassroom, findClassroomByCode, getMyClassrooms };
