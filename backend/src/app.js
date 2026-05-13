const express = require('express');
const cors = require('cors');
const app = express();

// --- CONFIGURACIÓN DE CORS ---
// Permitimos que tanto tu local como tu frontend de Vercel se conecten
const allowedOrigins = [
  'http://localhost:5173',                 // Tu entorno local
  'nuevo-m5fg900ej-stiven-narvaez-s-projects.vercel.app' // ¡REEMPLAZA ESTO con tu URL real de Vercel!
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origen (como Postman o apps móviles)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'El acceso desde este origen no está permitido por la política CORS.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// --- MIDDLEWARES ---
app.use(express.json()); 

// Confiar en el proxy de Render (necesario para HTTPS)
app.get('/', (req, res) => res.send('API de Licores Nicole funcionando 🚀'));

// --- DEFINICIÓN DE RUTAS ---
// Mantengo la estructura que tenías para que coincida con tus archivos actuales
app.use('/productos', require('./routes/productRoutes'));
app.use('/auth', require('./routes/authRoutes'));

// --- MANEJO DE ERRORES ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Algo salió mal en el servidor' });
});

// --- EXPORTACIÓN ---
module.exports = app;