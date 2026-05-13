const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();

// --- 1. CONFIGURACIÓN DE SEGURIDAD Y CORS ---
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

// --- 2. CONFIGURACIÓN DE ARCHIVOS (IMÁGENES) ---
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
    connectionLimit: 15,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

db.getConnection((err, connection) => {
    if (err) console.error('❌ ERROR DB:', err.message);
    else {
        console.log('✅ CONECTADO A AIVEN - TABLAS CLIENTES Y COMPRAS VINCULADAS');
        connection.release();
    }
});

// ==========================================
// 1. USUARIOS / AUTH
// ==========================================
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.query("SELECT * FROM usuarios WHERE email = ?", [email], async (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        if (data.length > 0) {
            const match = await bcrypt.compare(password, data[0].password);
            if (match) {
                return res.json({ 
                    message: "Login exitoso", 
                    usuario: data[0].nombre, 
                    id_usuario: data[0].id_usuario,
                    rol: data[0].rol 
                });
            }
        }
        res.status(401).json({ message: "Credenciales incorrectas" });
    });
});

// ==========================================
// 2. PRODUCTOS (INVENTARIO)
// ==========================================
app.get('/productos', (req, res) => {
    const sql = "SELECT id_producto AS id, nombre_producto AS nombre, categoria, precio, stock, imagen, descripcion FROM productos";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});

app.post('/productos', upload.single('imagen'), (req, res) => {
    const { nombre, categoria, precio, stock, descripcion } = req.body;
    const imagen = req.file ? req.file.filename : null;
    const sql = "INSERT INTO productos (nombre_producto, categoria, precio, stock, imagen, descripcion) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [nombre, categoria, precio, stock, imagen, descripcion], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Producto creado", id: result.insertId });
    });
});

app.delete('/productos/:id', (req, res) => {
    db.query("DELETE FROM productos WHERE id_producto = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Producto eliminado" });
    });
});

// ==========================================
// 3. VENTAS Y DETALLES
// ==========================================
app.post('/api/ventas', (req, res) => {
    const { id_usuario, total_venta, carrito } = req.body;
    db.query("INSERT INTO ventas (id_usuario, total_venta) VALUES (?, ?)", [id_usuario, total_venta], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        const id_venta = result.insertId;
        
        const queries = carrito.map(item => {
            return new Promise((resolve, reject) => {
                db.query("INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)", 
                [id_venta, item.id, item.cantidad, item.precio], (err) => {
                    if (err) reject(err);
                    db.query("UPDATE productos SET stock = stock - ? WHERE id_producto = ?", [item.cantidad, item.id], (err) => {
                        if (err) reject(err);
                        resolve();
                    });
                });
            });
        });

        Promise.all(queries)
            .then(() => res.status(201).json({ message: "Venta registrada", id_venta }))
            .catch(error => res.status(500).json({ error: error.message }));
    });
});

// ==========================================
// 4. GASTOS
// ==========================================
app.get('/api/gastos', (req, res) => {
    db.query("SELECT * FROM gastos ORDER BY fecha DESC", (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});

app.post('/api/gastos', (req, res) => {
    const { descripcion, monto, categoria } = req.body;
    db.query("INSERT INTO gastos (descripcion, monto, categoria) VALUES (?, ?, ?)", 
    [descripcion, monto, categoria], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Gasto registrado", id: result.insertId });
    });
});

// ==========================================
// 5. CLIENTES (ACTUALIZADO)
// ==========================================
app.get('/api/clientes', (req, res) => {
    db.query("SELECT id_cliente, nombre, documento, telefono, correo, direccion FROM clientes", (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});

app.post('/api/clientes', (req, res) => {
    const { nombre, documento, telefono, correo, direccion } = req.body;
    const sql = "INSERT INTO clientes (nombre, documento, telefono, correo, direccion) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [nombre, documento, telefono, correo, direccion], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Cliente registrado", id_cliente: result.insertId });
    });
});

// ==========================================
// 6. COMPRAS (ACTUALIZADO)
// ==========================================
app.get('/api/compras', (req, res) => {
    db.query("SELECT id_compra, id_usuario, total_compradecimal AS total, fecha_compra FROM compras ORDER BY fecha_compra DESC", (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});

app.post('/api/compras', (req, res) => {
    const { id_usuario, total_compradecimal } = req.body;
    const sql = "INSERT INTO compras (id_usuario, total_compradecimal) VALUES (?, ?)";
    db.query(sql, [id_usuario, total_compradecimal], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Compra registrada", id_compra: result.insertId });
    });
});

// ==========================================
// 7. DASHBOARD (ESTADÍSTICAS INTEGRAL)
// ==========================================
app.get('/api/dashboard', (req, res) => {
    const qVentas = "SELECT IFNULL(SUM(total_venta), 0) as totalIngresos FROM ventas";
    const qGastos = "SELECT IFNULL(SUM(monto), 0) as totalGastos FROM gastos";
    const qCompras = "SELECT IFNULL(SUM(total_compradecimal), 0) as totalCompras FROM compras";
    const qProd = "SELECT COUNT(*) as totalProductos FROM productos";
    const qStock = "SELECT nombre_producto as nombre, stock FROM productos WHERE stock <= 5";

    db.query(qVentas, (err1, rVentas) => {
        db.query(qGastos, (err2, rGastos) => {
            db.query(qCompras, (err3, rCompras) => {
                db.query(qProd, (err4, rProd) => {
                    db.query(qStock, (err5, rStock) => {
                        if (err1 || err2 || err3 || err4 || err5) return res.status(500).json({ error: "Error dashboard" });
                        res.json({
                            totalIngresos: rVentas[0].totalIngresos,
                            totalGastos: rGastos[0].totalGastos,
                            totalCompras: rCompras[0].totalCompras,
                            totalProductos: rProd[0].totalProductos,
                            alertasStock: rStock 
                        });
                    });
                });
            });
        });
    });
});

// --- INICIO ---
app.get('/', (req, res) => res.send('🚀 Servidor Licores Nicole v2.1 - API Completa con Clientes y Compras'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});