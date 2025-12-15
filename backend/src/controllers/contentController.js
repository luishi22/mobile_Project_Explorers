const World = require("../models/World");
const Post = require("../models/Post");
const Classroom = require("../models/Classroom");

// ================= GESTIÓN DE MUNDOS =================

// @desc    Crear un Nuevo Mundo
// @route   POST /api/content/worlds
const createWorld = async (req, res) => {
  try {
    if (req.user.rol !== "maestro") {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    const { nombre, descripcion, imagen_portada, aula_id } = req.body;

    const world = await World.create({
      nombre,
      descripcion,
      imagen_portada,
      aula_id,
      // NOTA: Ya no guardamos dificultad aquí.
    });

    res.status(201).json(world);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Agregar Actividad a un Mundo
// @route   POST /api/content/worlds/:id/activity
const addActivityToWorld = async (req, res) => {
  try {
    // 🆕 RECIBIMOS 'dificultad' AQUÍ
    const {
      titulo,
      descripcion,
      video_url,
      imagen_preview,
      recompensa_xp,
      dificultad,
    } = req.body;
    const worldId = req.params.id;

    const world = await World.findById(worldId);

    if (!world) {
      return res.status(404).json({ message: "Mundo no encontrado" });
    }

    const newActivity = {
      titulo,
      descripcion, // Guardamos la descripción
      video_url,
      imagen_preview,
      recompensa_xp: recompensa_xp || 10,
      dificultad: dificultad || "facil", // 🆕 Guardamos la dificultad (default facil)
    };

    world.actividades.push(newActivity);
    await world.save();

    res.status(201).json(world);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Editar una Actividad específica
// @route   PUT /api/content/worlds/:worldId/activity/:activityId
const updateActivity = async (req, res) => {
  try {
    const { worldId, activityId } = req.params;
    // 🆕 Agregamos 'dificultad' para poder editarla
    const {
      titulo,
      descripcion,
      video_url,
      imagen_preview,
      recompensa_xp,
      dificultad,
    } = req.body;

    const world = await World.findOneAndUpdate(
      { _id: worldId, "actividades._id": activityId },
      {
        $set: {
          "actividades.$.titulo": titulo,
          "actividades.$.descripcion": descripcion,
          "actividades.$.video_url": video_url,
          "actividades.$.imagen_preview": imagen_preview,
          "actividades.$.recompensa_xp": recompensa_xp,
          "actividades.$.dificultad": dificultad, // 🆕 Actualizamos dificultad
        },
      },
      { new: true }
    );

    res.json(world);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ... (EL RESTO DE TUS FUNCIONES SE QUEDAN IGUAL: getWorldsByClassroom, createPost, etc.) ...
// Copia y pega el resto de tu archivo original aquí abajo, ya que no requieren cambios.

// @desc    Obtener Mundos de un Aula
const getWorldsByClassroom = async (req, res) => {
  try {
    const { aula_id } = req.params;
    const worlds = await World.find({ aula_id });
    res.json(worlds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPost = async (req, res) => {
  try {
    const { titulo, contenido, tipo, adjuntos, aula_id } = req.body;
    const post = await Post.create({
      titulo,
      contenido,
      tipo,
      adjuntos: adjuntos || [],
      aula_id,
      autor_id: req.user.id,
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPostsByClassroom = async (req, res) => {
  try {
    const { aula_id } = req.params;
    const posts = await Post.find({ aula_id })
      .sort({ fecha_publicacion: -1 })
      .populate("autor_id", "nombre email")
      .populate("aula_id", "nombre");
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getWorldById = async (req, res) => {
  try {
    const world = await World.findById(req.params.id);
    if (!world) return res.status(404).json({ message: "Mundo no encontrado" });
    res.json(world);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteActivity = async (req, res) => {
  try {
    const { worldId, activityId } = req.params;
    const world = await World.findByIdAndUpdate(
      worldId,
      { $pull: { actividades: { _id: activityId } } },
      { new: true }
    );
    if (!world) return res.status(404).json({ message: "Mundo no encontrado" });
    res.json(world);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateWorld = async (req, res) => {
  try {
    const world = await World.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(world);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteWorld = async (req, res) => {
  try {
    await World.findByIdAndDelete(req.params.id);
    res.json({ message: "Mundo eliminado" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post eliminado" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createWorld,
  addActivityToWorld,
  getWorldsByClassroom,
  getWorldById,
  updateWorld,
  deleteWorld,
  updateActivity,
  deleteActivity,
  createPost,
  getPostsByClassroom,
  updatePost,
  deletePost,
};
