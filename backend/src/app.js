const express = require('express');
const cors = require('cors');
const app = express();

// --- MIDDLEWARES ---
// cors() permite que tu Frontend (puerto 5173) hable con este Backend (puerto 4000)
app.use(cors()); 
// express.json() permite que tu servidor reciba y entienda datos en formato JSON
app.use(express.json()); 

// --- DEFINICIÓN DE RUTAS ---
// He quitado el '/api' para que tus rutas sean más limpias y coincidan 
// con el fetch de tu Dashboard: http://192.168.18.28:4000/productos
app.use('/productos', require('./routes/productRoutes'));
app.use('/auth', require('./routes/authRoutes'));

// El servidor ahora usará exclusivamente tus controladores para responder.

module.exports = app;