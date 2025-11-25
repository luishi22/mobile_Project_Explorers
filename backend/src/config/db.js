const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Intentar conectar con la URL que pusiste en el .env
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ Base de Datos Conectada: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error de conexión: ${error.message}`);
    // Si falla, detener el servidor para no causar problemas
    process.exit(1);
  }
};

module.exports = connectDB;
