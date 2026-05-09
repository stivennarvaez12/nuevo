const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer'); 
const path = require('path');     
const fs = require('fs');         
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
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

// --- CONEXIÓN A BASE DE DATOS ---
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'licores_nicole'
});

db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conexión a MYSQL establecida (licores_nicole)');
});

// ==========================================
//           RUTAS DE USUARIOS / LOGIN
// ==========================================

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM usuarios WHERE email = ?";
    db.query(sql, [email], async (err, data) => {
        if (err) return res.status(500).json({ message: "Error en la base de datos" });
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
        return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    });
});

// ==========================================
//           RUTAS DE INVENTARIO (BEBIDAS)
// ==========================================

app.get('/productos', (req, res) => {
    const sql = "SELECT id_producto AS id, nombre_producto AS nombre, categoria, precio, stock, imagen FROM productos";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

app.post('/productos', upload.single('imagen'), (req, res) => {
    const { nombre, categoria, precio, stock } = req.body;
    const imagen = req.file ? req.file.filename : null; 
    const sql = "INSERT INTO productos (nombre_producto, categoria, precio, stock, imagen) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [nombre, categoria, precio, stock, imagen], (err, result) => {
        if (err) return res.status(500).json({ message: "Error interno" });
        return res.status(201).json({ message: "Producto guardado", id: result.insertId });
    });
});

app.put('/productos/:id', upload.single('imagen'), (req, res) => {
    const { id } = req.params;
    const { nombre, categoria, precio, stock } = req.body;
    const nuevaImagen = req.file ? req.file.filename : null;

    if (nuevaImagen) {
        const sql = "UPDATE productos SET nombre_producto = ?, categoria = ?, precio = ?, stock = ?, imagen = ? WHERE id_producto = ?";
        db.query(sql, [nombre, categoria, precio, stock, nuevaImagen, id], (err, result) => {
            if (err) return res.status(500).json(err);
            return res.json({ message: "Producto actualizado" });
        });
    } else {
        const sql = "UPDATE productos SET nombre_producto = ?, categoria = ?, precio = ?, stock = ? WHERE id_producto = ?";
        db.query(sql, [nombre, categoria, precio, stock, id], (err, result) => {
            if (err) return res.status(500).json(err);
            return res.json({ message: "Producto actualizado" });
        });
    }
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
//           RUTAS DE VENTAS
// ==========================================

app.post('/api/ventas', (req, res) => {
    const { id_usuario, total_venta, carrito } = req.body;
    const sqlVenta = "INSERT INTO ventas (id_usuario, total_venta) VALUES (?, ?)";
    db.query(sqlVenta, [id_usuario, total_venta], (err, result) => {
        if (err) return res.status(500).json({ message: "Error al registrar la venta" });
        const id_venta = result.insertId;
        carrito.forEach(item => {
            const sqlDetalle = "INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)";
            db.query(sqlDetalle, [id_venta, item.id, item.cantidad, item.precio]);
            const sqlStock = "UPDATE productos SET stock = stock - ? WHERE id_producto = ?";
            db.query(sqlStock, [item.cantidad, item.id]);
        });
        return res.status(201).json({ message: "Venta registrada con éxito", id_venta });
    });
});

app.get('/api/ventas', (req, res) => {
    const sql = "SELECT * FROM ventas ORDER BY id_venta DESC";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json({ message: "Error al obtener historial" });
        return res.json(data);
    });
});

app.get('/api/ventas/:id', (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT dv.id_detalle, dv.cantidad, dv.precio_unitario, p.nombre_producto 
        FROM detalle_ventas dv
        JOIN productos p ON dv.id_producto = p.id_producto
        WHERE dv.id_venta = ?`;
    db.query(sql, [id], (err, data) => {
        if (err) return res.status(500).json({ message: "Error en el servidor" });
        return res.json(data);
    });
});

// ==========================================
//           RUTAS DE COMPRAS
// ==========================================

app.post('/api/compras', (req, res) => {
    const { id_usuario, total_compra, carrito } = req.body;
    const sqlCompra = "INSERT INTO compras (id_usuario, total_compra) VALUES (?, ?)";
    db.query(sqlCompra, [id_usuario, total_compra], (err, result) => {
        if (err) return res.status(500).json({ message: "Error al registrar la compra" });
        const id_compra = result.insertId;
        carrito.forEach(item => {
            const sqlDetalle = "INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_costo) VALUES (?, ?, ?, ?)";
            db.query(sqlDetalle, [id_compra, item.id, item.cantidad, item.precio_costo]);
            const sqlStock = "UPDATE productos SET stock = stock + ? WHERE id_producto = ?";
            db.query(sqlStock, [item.cantidad, item.id]);
        });
        return res.status(201).json({ message: "Compra registrada", id_compra });
    });
});

app.get('/api/compras', (req, res) => {
    const sql = "SELECT * FROM compras ORDER BY id_compra DESC";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json({ message: "Error al obtener historial" });
        return res.json(data);
    });
});

// ==========================================
//           RUTAS DE GASTOS
// ==========================================

app.post('/api/gastos', (req, res) => {
    const { id_usuario, descripcion, monto } = req.body;
    const sql = "INSERT INTO gastos (id_usuario, descripcion, monto) VALUES (?, ?, ?)";
    db.query(sql, [id_usuario, descripcion, monto], (err, result) => {
        if (err) return res.status(500).json({ message: "Error al registrar el gasto" });
        return res.status(201).json({ message: "Gasto registrado con éxito", id_gasto: result.insertId });
    });
});

app.get('/api/gastos', (req, res) => {
    const sql = "SELECT * FROM gastos ORDER BY id_gasto DESC";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json({ message: "Error al obtener gastos" });
        return res.json(data);
    });
});

// ==========================================
//           RUTAS DE CLIENTES
// ==========================================

app.post('/api/clientes', (req, res) => {
    const { nombre, documento, telefono, correo, direccion } = req.body;
    
    const sql = "INSERT INTO clientes (nombre, documento, telefono, correo, direccion) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [nombre, documento, telefono, correo, direccion], (err, result) => {
        if (err) {
            console.error("Error en DB MySQL:", err);
            return res.status(500).json({ message: "Error al registrar el cliente", error: err });
        }
        return res.status(201).json({ message: "Cliente registrado con éxito", id_cliente: result.insertId });
    });
});

app.get('/api/clientes', (req, res) => {
    const sql = "SELECT * FROM clientes ORDER BY id_cliente DESC";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json({ message: "Error al obtener clientes" });
        return res.json(data);
    });
});

// ==========================================
//           RUTAS DE ROLES
// ==========================================
app.get('/api/roles', (req, res) => {
    const sql = "SELECT * FROM roles";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// ==========================================
//           RUTAS DE USUARIOS
// ==========================================

app.get('/api/usuarios', (req, res) => {
    const sql = `
        SELECT u.id_usuario, u.nombre, u.email, u.estado, r.nombre_rol 
        FROM usuarios u 
        INNER JOIN roles r ON u.id_rol = r.id_rol
    `;
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

app.post('/api/usuarios', async (req, res) => {
    const { nombre, email, password, id_rol } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO usuarios (nombre, email, password, id_rol, estado) VALUES (?, ?, ?, ?, 1)";
        db.query(sql, [nombre, email, hashedPassword, id_rol], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Error al registrar usuario" });
            }
            return res.status(201).json({ message: "Usuario creado con éxito" });
        });
    } catch (error) {
        return res.status(500).json({ message: "Error procesando la contraseña" });
    }
});

app.delete('/api/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM usuarios WHERE id_usuario = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json({ message: "Usuario eliminado" });
    });
});

// ==========================================
//           RUTAS DEL DASHBOARD (INICIO)
// ==========================================

app.get('/api/dashboard', (req, res) => {
    const queryVentas = "SELECT IFNULL(SUM(total_venta), 0) as totalIngresos FROM ventas";
    const queryProductos = "SELECT COUNT(*) as totalProductos FROM productos";
    const queryStock = "SELECT nombre_producto as nombre, stock FROM productos WHERE stock <= 5";

    db.query(queryVentas, (err1, resVentas) => {
        if (err1) return res.status(500).json(err1);
        db.query(queryProductos, (err2, resProductos) => {
            if (err2) return res.status(500).json(err2);
            db.query(queryStock, (err3, resStock) => {
                if (err3) return res.status(500).json(err3);
                return res.json({
                    totalIngresos: resVentas[0].totalIngresos,
                    totalProductos: resProductos[0].totalProductos,
                    alertasStock: resStock 
                });
            });
        });
    });
});

// --- ENCENDIDO DEL SERVIDOR ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});