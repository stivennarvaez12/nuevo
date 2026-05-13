const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer'); 
const path = require('path');     
const fs = require('fs');         
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();

// --- CONFIGURACIÓN DE CORS ---
const allowedOrigins = [
    'http://localhost:5173',
    'https://frontend-licores.vercel.app', // <-- CAMBIA ESTO por tu URL de Vercel
    /\.vercel\.app$/ // Esto permite cualquier subdominio de vercel.app
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.some(domain => 
            typeof domain === 'string' ? domain === origin : domain.test(origin)
        )) {
            callback(null, true);
        } else {
            callback(new Error('CORS no permitido por seguridad'));
        }
    },
    credentials: true
}));

app.use(express.json());

// --- CONFIGURACIÓN DE FOTOS ---
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// --- CONFIGURACIÓN DE MULTER ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage: storage });

// --- CONEXIÓN A BASE DE DATOS (CONFIGURADA PARA AIVEN) ---
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'defaultdb', // Ajustado a defaultdb según tu Aiven
    port: process.env.DB_PORT || 12668,
    ssl: {
        rejectUnauthorized: false 
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Probar conexión y mostrar error claro en consola
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ ERROR CRÍTICO DB:', err.message);
    } else {
        console.log('✅ CONECTADO A AIVEN MYSQL (defaultdb)');
        connection.release();
    }
});

// ==========================================
//           RUTAS DE USUARIOS / LOGIN
// ==========================================

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM usuarios WHERE email = ?";
    db.query(sql, [email], async (err, data) => {
        if (err) return res.status(500).json({ message: "Error en DB", error: err.message });
        
        if (data.length > 0) {
            const match = await bcrypt.compare(password, data[0].password);
            if (match) {
                return res.json({ 
                    message: "Login exitoso", 
                    token: "token_admin_valido_123",
                    usuario: data[0].nombre,
                    id_usuario: data[0].id_usuario 
                });
            }
        }
        return res.status(401).json({ message: "Credenciales inválidas" });
    });
});

// ==========================================
//           RUTAS DE INVENTARIO
// ==========================================

app.get('/productos', (req, res) => {
    const sql = "SELECT id_producto AS id, nombre_producto AS nombre, categoria, precio, stock, imagen FROM productos";
    db.query(sql, (err, data) => {
        if (err) {
            return res.status(500).json({ 
                error: "Error al leer productos", 
                detalle: "Asegúrate de haber creado la tabla 'productos' en Aiven",
                db_error: err.message 
            });
        }
        return res.json(data);
    });
});

app.post('/productos', upload.single('imagen'), (req, res) => {
    const { nombre, categoria, precio, stock } = req.body;
    const imagen = req.file ? req.file.filename : null; 
    const sql = "INSERT INTO productos (nombre_producto, categoria, precio, stock, imagen) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [nombre, categoria, precio, stock, imagen], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(201).json({ message: "Producto guardado", id: result.insertId });
    });
});

app.delete('/productos/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM productos WHERE id_producto = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json({ message: "Producto eliminado" });
    });
});

// ==========================================
//           VENTAS, CLIENTES Y DASHBOARD
// ==========================================

app.post('/api/ventas', (req, res) => {
    const { id_usuario, total_venta, carrito } = req.body;
    const sqlVenta = "INSERT INTO ventas (id_usuario, total_venta) VALUES (?, ?)";
    db.query(sqlVenta, [id_usuario, total_venta], (err, result) => {
        if (err) return res.status(500).json({ message: "Error al registrar venta" });
        const id_venta = result.insertId;
        
        const queries = carrito.map(item => {
            return new Promise((resolve, reject) => {
                const sqlDetalle = "INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)";
                db.query(sqlDetalle, [id_venta, item.id, item.cantidad, item.precio], (err) => {
                    if (err) reject(err);
                    const sqlStock = "UPDATE productos SET stock = stock - ? WHERE id_producto = ?";
                    db.query(sqlStock, [item.cantidad, item.id], (err) => {
                        if (err) reject(err);
                        resolve();
                    });
                });
            });
        });

        Promise.all(queries)
            .then(() => res.status(201).json({ message: "Venta exitosa", id_venta }))
            .catch(error => res.status(500).json({ error: error.message }));
    });
});

app.get('/api/clientes', (req, res) => {
    const sql = "SELECT * FROM clientes ORDER BY id_cliente DESC";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json(data);
    });
});

app.get('/api/dashboard', (req, res) => {
    const queryVentas = "SELECT IFNULL(SUM(total_venta), 0) as totalIngresos FROM ventas";
    const queryProductos = "SELECT COUNT(*) as totalProductos FROM productos";
    const queryStock = "SELECT nombre_producto as nombre, stock FROM productos WHERE stock <= 5";

    db.query(queryVentas, (err1, resVentas) => {
        db.query(queryProductos, (err2, resProductos) => {
            db.query(queryStock, (err3, resStock) => {
                if (err1 || err2 || err3) return res.status(500).json({ error: "Error en consultas dashboard" });
                return res.json({
                    totalIngresos: resVentas[0].totalIngresos,
                    totalProductos: resProductos[0].totalProductos,
                    alertasStock: resStock 
                });
            });
        });
    });
});

// Ruta raíz para Render
app.get('/', (req, res) => res.send('🚀 Servidor Licores Nicole funcionando en Render'));

// --- ENCENDIDO DEL SERVIDOR ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor en puerto ${PORT}`);
});