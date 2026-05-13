const mysql = require('mysql2');
const cors = require('cors');
const express = require('express');
const multer = require('multer'); 
const path = require('path');     
const fs = require('fs');         
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();

// --- 1. CONFIGURACIÓN DE CORS ---
const allowedOrigins = [
    'http://localhost:5173',
    'https://nuevo-ruddy.vercel.app',
    'https://frontend-licores.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('CORS no permitido por seguridad'));
        }
    },
    credentials: true
}));

app.use(express.json());

// --- 2. CONFIGURACIÓN DE FOTOS (Corregido para carpeta src) ---
// Usamos process.cwd() para que la carpeta 'uploads' se cree en la raíz, no dentro de src
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// --- 3. CONEXIÓN A BASE DE DATOS (AIVEN) ---
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'defaultdb',
    port: process.env.DB_PORT || 12668,
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ ERROR DB AIVEN:', err.message);
    } else {
        console.log('✅ CONECTADO A AIVEN MYSQL EXITOSAMENTE');
        connection.release();
    }
});

// --- RUTAS ---

app.get('/productos', (req, res) => {
    const sql = "SELECT id_producto AS id, nombre_producto AS nombre, categoria, precio, stock, imagen FROM productos";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM usuarios WHERE email = ?";
    db.query(sql, [email], async (err, data) => {
        if (err) return res.status(500).json({ message: "Error en DB" });
        if (data.length > 0) {
            const match = await bcrypt.compare(password, data[0].password);
            if (match) {
                return res.json({ 
                    message: "Login exitoso", 
                    usuario: data[0].nombre,
                    id_usuario: data[0].id_usuario 
                });
            }
        }
        return res.status(401).json({ message: "Credenciales inválidas" });
    });
});

app.delete('/productos/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM productos WHERE id_producto = ?', [id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Eliminado" });
    });
});

app.get('/', (req, res) => res.send('🚀 Backend Nicole Admin Activo en Render'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});