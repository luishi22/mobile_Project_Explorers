const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db.js");

// Importar Rutas
const authRoutes = require("./src/routes/auth.routes");
const classroomRoutes = require("./src/routes/classroom.routes");
const studentRoutes = require("./src/routes/student.routes");
const contentRoutes = require("./src/routes/content.routes");
// Configuración
dotenv.config();
connectDB();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// RUTAS (ENDPOINTS)
app.use("/api/auth", authRoutes);
app.use("/api/classrooms", classroomRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/content", contentRoutes);

// Ruta base
app.get("/", (req, res) => {
  res.send("🚀 API de Pequeños Exploradores funcionando correctamente.");
});

// Arrancar
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`⚡ Servidor corriendo en el puerto: ${PORT}`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`==================================================\n`);
});
