const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;

  // Verificar si hay token en el header (Authorization: Bearer <token>)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Obtener el token (quitar la palabra "Bearer")
      token = req.headers.authorization.split(" ")[1];

      // Decodificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Guardar los datos del usuario en la petición (req.user)
      req.user = decoded;

      next(); // Dejar pasar
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = protect;
