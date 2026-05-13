const mysql = require('mysql2/promise');
require('dotenv').config();

// Creamos el pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // 🔹 CONFIGURACIÓN CRUCIAL PARA CLOUD (Aiven/Render)
  ssl: {
    rejectUnauthorized: false
  },
  enableKeepAlive: true, // Mantiene la conexión viva
  keepAliveInitialDelay: 10000 
});

// Verificación de salud de la conexión al arrancar el servidor
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('-----------------------------------------');
    console.log('✅ CONEXIÓN EXITOSA: MySQL en Aiven está listo');
    console.log(`🏠 Host: ${process.env.DB_HOST}`);
    console.log(`🗄️  Base de Datos: ${process.env.DB_NAME}`);
    console.log('-----------------------------------------');
    connection.release();
  } catch (error) {
    console.error('-----------------------------------------');
    console.error('❌ ERROR CRÍTICO: No se pudo conectar a Aiven');
    console.error('MENSAJE:', error.message);
    console.error('-----------------------------------------');
    
    // En producción (Render), esto forzará un reinicio si la DB no responde
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
  }
})();

module.exports = pool;