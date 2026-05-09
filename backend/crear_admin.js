const mysql = require('mysql2');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Conexión a tu base de datos
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'licores_nicole'
});

const crearUsuario = async () => {
    // Datos del nuevo súper administrador
    const nombre = 'Stiven Admin';
    const email = 'admin@licoresnicole.com';
    const passwordPlana = '123456';

    try {
        // Magia: Encriptamos la contraseña
        const passwordEncriptada = await bcrypt.hash(passwordPlana, 10);

        // Guardamos en la base de datos
        const sql = "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)";
        
        db.query(sql, [nombre, email, passwordEncriptada], (err, result) => {
            if (err) {
                console.error("❌ Error creando el usuario (Quizás el correo ya existe):", err.message);
            } else {
                console.log("✅ ¡Usuario administrador creado con éxito en MySQL!");
                console.log("-----------------------------------------");
                console.log("📧 Correo: ", email);
                console.log("🔑 Contraseña: ", passwordPlana);
                console.log("-----------------------------------------");
                console.log("Ya puedes borrar este archivo y entrar al sistema.");
            }
            process.exit(); // Cerramos el script
        });
    } catch (error) {
        console.error("Error encriptando:", error);
        process.exit();
    }
};

crearUsuario();