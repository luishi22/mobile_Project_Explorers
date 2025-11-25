const Student = require("../models/Student");

// @desc    Crear Estudiante (Padre crea a su hijo)
// @route   POST /api/students
const createStudent = async (req, res) => {
  try {
    const { nombre, edad, genero, aula_id } = req.body;

    const student = await Student.create({
      nombre,
      edad,
      genero,
      padre_id: req.user.id, // Viene del Token
      aula_id, // Viene del paso anterior (buscar por código)
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtener mis hijos
// @route   GET /api/students/my-children
const getMyChildren = async (req, res) => {
  try {
    const students = await Student.find({ padre_id: req.user.id }).populate(
      "aula_id",
      "nombre"
    ); // Trae el nombre del aula
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createStudent, getMyChildren };
