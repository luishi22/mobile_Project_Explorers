const nodemailer = require("nodemailer");
const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");

const sendEmail = async (options) => {
  // 1. Crear el "Transportador" (El camión de correos)
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, // El puerto seguro oficial de Google
    secure: true, // Obliga a usar una conexión encriptada SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    family: 4,
  });

  // 2. Definir qué lleva el correo
  const mailOptions = {
    from: `"Soporte PEQUEMOV" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3. ¡Enviarlo!
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
