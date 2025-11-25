const Student = require("../models/Student");
const Classroom = require("../models/Classroom");

// @desc    Crear Estudiante (Padre crea a su hijo)
// @route   POST /api/students
const createStudent = async (req, res) => {
  try {
    const { nombre, edad, genero, aula_id } = req.body;

    // Crear al estudiante
    const student = await Student.create({
      nombre,
      edad,
      genero,
      padre_id: req.user.id,
      aula_id,
    });

    // Actualizar el array 'alumnos' dentro del Classroom
    // Usamos $push para "empujar" el nuevo ID al array sin borrar los anteriores
    await Classroom.findByIdAndUpdate(aula_id, {
      $push: { alumnos: student._id },
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

// @desc    Marcar actividad como completada
// @route   POST /api/students/:studentId/complete
const markActivityComplete = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { actividad_id, mundo_id, xp_ganado } = req.body;

    // Buscar al estudiante
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Estudiante no encontrado" });
    }

    // Verificar si ya la completó antes (Para no dar puntos dobles)
    // Buscamos si el ID de la actividad ya existe en su array
    const yaCompletada = student.actividades_completadas.find(
      (item) => item.actividad_id === actividad_id
    );

    if (yaCompletada) {
      return res
        .status(200)
        .json({ message: "Esta actividad ya estaba completada" });
    }

    //Si es nueva: Agregar al historial y sumar XP
    student.actividades_completadas.push({ actividad_id, mundo_id });
    student.progreso_xp += xp_ganado || 10; // Suma 10 puntos por defecto si no envías xp

    await student.save();

    res.status(200).json({
      message: "¡Actividad completada!",
      nuevo_xp: student.progreso_xp,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createStudent, getMyChildren, markActivityComplete };
