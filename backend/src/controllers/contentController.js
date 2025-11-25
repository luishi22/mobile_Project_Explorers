const World = require("../models/World");
const Post = require("../models/Post");
const Classroom = require("../models/Classroom");

// ==========================================
// 🌍 GESTIÓN DE MUNDOS Y ACTIVIDADES
// ==========================================

// @desc    Crear un Nuevo Mundo (Ej: "La Selva")
// @route   POST /api/content/worlds
const createWorld = async (req, res) => {
  try {
    // Solo el maestro puede crear
    if (req.user.rol !== "maestro") {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    const { nombre, descripcion, imagen_portada, aula_id } = req.body;

    const world = await World.create({
      nombre,
      descripcion,
      imagen_portada,
      aula_id, // ¡Importante! El mundo pertenece a un salón específico
    });

    res.status(201).json(world);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Agregar Actividad a un Mundo (Ej: "Saltos de Rana")
// @route   POST /api/content/worlds/:id/activity
const addActivityToWorld = async (req, res) => {
  try {
    const { titulo, video_url, imagen_preview, recompensa_xp } = req.body;
    const worldId = req.params.id; // El ID del mundo viene en la URL

    // 1. Buscar el mundo
    const world = await World.findById(worldId);

    if (!world) {
      return res.status(404).json({ message: "Mundo no encontrado" });
    }

    // 2. Crear el objeto de la actividad
    const newActivity = {
      titulo,
      video_url, // Link de YouTube
      imagen_preview,
      recompensa_xp: recompensa_xp || 10,
    };

    // 3. Empujar al arreglo de actividades
    world.actividades.push(newActivity);

    // 4. Guardar cambios
    await world.save();

    res.status(201).json(world);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtener Mundos de un Aula (Para que el niño los vea)
// @route   GET /api/content/worlds/classroom/:aula_id
const getWorldsByClassroom = async (req, res) => {
  try {
    const { aula_id } = req.params;
    const worlds = await World.find({ aula_id });
    res.json(worlds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 📰 GESTIÓN DE POSTS (NOTICIAS)
// ==========================================

// @desc    Crear un Post (Aviso para padres)
// @route   POST /api/content/posts
const createPost = async (req, res) => {
  try {
    if (req.user.rol !== "maestro") {
      return res.status(403).json({ message: "Solo maestros publican" });
    }

    const { titulo, contenido, tipo, imagen_url, aula_id } = req.body;

    const post = await Post.create({
      titulo,
      contenido,
      tipo,
      imagen_url,
      aula_id,
      autor_id: req.user.id,
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtener Posts de mi Aula (Para el Home del Padre)
// @route   GET /api/content/posts/classroom/:aula_id
const getPostsByClassroom = async (req, res) => {
  try {
    const { aula_id } = req.params;
    // Ordenar por fecha: los más nuevos primero (-1)
    const posts = await Post.find({ aula_id }).sort({ fecha_publicacion: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createWorld,
  addActivityToWorld,
  getWorldsByClassroom,
  createPost,
  getPostsByClassroom,
};
