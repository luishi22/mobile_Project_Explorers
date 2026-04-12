const axios = require("axios");

const sendEmail = async (options) => {
  // La URL oficial de la API de Brevo
  const url = "https://api.brevo.com/v3/smtp/email";

  // Estructuramos el mensaje exactamente como Brevo lo pide
  const payload = {
    sender: {
      name: "Soporte PEQUEMOV",
      email: process.env.EMAIL_USER, // Debe coincidir con tu correo verificado en Brevo
    },
    to: [
      { email: options.email }, // El correo del usuario que olvidó su clave
    ],
    subject: options.subject,
    textContent: options.message,
  };

  // Configuramos las cabeceras con nuestra llave de seguridad
  const headers = {
    accept: "application/json",
    "api-key": process.env.BREVO_API_KEY,
    "content-type": "application/json",
  };

  try {
    // Enviamos la petición por HTTPS (Puerto 443, libre de bloqueos)
    await axios.post(url, payload, { headers });
    console.log("Correo enviado exitosamente vía Brevo API");
  } catch (error) {
    console.error(
      "Error de Brevo:",
      error.response ? error.response.data : error.message,
    );
    throw new Error(
      "No se pudo enviar el correo. Revisa la configuración de Brevo.",
    );
  }
};

module.exports = sendEmail;
