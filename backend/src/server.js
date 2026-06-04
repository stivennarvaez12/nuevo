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
        console.log('✅ CONECTADO A AIVEN - OPERANDO EN SRC/SERVER.JS');
        connection.release();
    }
});

// ==========================================
// 1. USUARIOS / ROLES / AUTH
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

app.get('/api/usuarios', (req, res) => {
    const sql = `
        SELECT u.id_usuario, u.nombre, u.email, r.nombre_rol 
        FROM usuarios u
        LEFT JOIN roles r ON u.id_rol = r.id_rol
    `;
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});

app.post('/api/usuarios', async (req, res) => {
    const { nombre, email, password, id_rol } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO usuarios (nombre, email, password, id_rol) VALUES (?, ?, ?, ?)";
        db.query(sql, [nombre, email, hashedPassword, id_rol], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: "Usuario creado con éxito", id: result.insertId });
        });
    } catch (error) {
        res.status(500).json({ error: "Error al procesar la contraseña" });
    }
});

app.delete('/api/usuarios/:id', (req, res) => {
    db.query("DELETE FROM usuarios WHERE id_usuario = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Usuario eliminado" });
    });
});

app.get('/api/roles', (req, res) => {
    db.query("SELECT * FROM roles ORDER BY id_rol ASC", (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});

app.post('/api/roles', (req, res) => {
    const { nombre_rol } = req.body;
    db.query("INSERT INTO roles (nombre_rol) VALUES (?)", [nombre_rol], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Rol creado", id_rol: result.insertId });
    });
});

// ==========================================
// 2. PRODUCTOS (INVENTARIO) - REPARACIÓN REAL CONTRA LLAVES FORÁNEAS 🍾
// ==========================================

// 🔄 GET: Obtener todos los productos
app.get('/api/productos', (req, res) => {
    const sql = "SELECT id_producto AS id, nombre_producto AS nombre, categoria, precio, stock, imagen, descripcion FROM productos";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});

// ➕ POST: Crear un producto individualmente
app.post('/api/productos', upload.single('imagen'), (req, res) => {
    const { nombre, categoria, precio, stock, descripcion } = req.body;
    const imagen = req.file ? req.file.filename : null;
    const sql = "INSERT INTO productos (nombre_producto, categoria, precio, stock, imagen, descripcion) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [nombre, categoria, precio, stock, imagen, descripcion], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Producto creado", id: result.insertId });
    });
});

// 🛠️ PUT: CORREGIDO PARA PRODUCTOS YA VENDIDOS (PROTEGE LLAVES REFERENCIALES)
app.put('/api/productos/:id', upload.single('imagen'), (req, res) => {
    const { id } = req.params;
    
    // Normalizamos las entradas para priorizar lo que envía el Frontend de licores de forma limpia
    const nombre = req.body.nombre || req.body.nombre_producto;
    const categoria = req.body.categoria;
    const stock = parseInt(req.body.stock) ?? 0;
    const descripcion = req.body.descripcion || null;

    // Sanatización estricta del precio: Evaluamos primero 'precio' que es el campo estándar de nuestro formulario
    let precioRaw = req.body.precio || req.body.precio_venta || 0;
    if (typeof precioRaw === 'string') {
        precioRaw = precioRaw.replace(/[^0-9.]/g, ''); // Quitamos caracteres extraños y dejamos solo números/puntos
    }
    const precio = parseFloat(precioRaw) || 0;

    // Evaluamos si subieron una foto nueva
    const imagen = req.file ? req.file.filename : null;

    let sql = "";
    let params = [];

    // NOTA DE CONTROL: La condición WHERE apunta estrictamente a 'id_producto' y no se alteran campos clave.
    if (imagen) {
        sql = "UPDATE productos SET nombre_producto = ?, categoria = ?, precio = ?, stock = ?, imagen = ?, descripcion = ? WHERE id_producto = ?";
        params = [nombre, categoria, precio, stock, imagen, descripcion, id];
    } else {
        sql = "UPDATE productos SET nombre_producto = ?, categoria = ?, precio = ?, stock = ?, descripcion = ? WHERE id_producto = ?";
        params = [nombre, categoria, precio, stock, descripcion, id];
    }

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error("❌ Error en MySQL al editar:", err.message);
            return res.status(500).json({ error: "La base de datos rechazó la modificación por integridad de ventas: " + err.message });
        }
        res.status(200).json({ message: "¡Licor actualizado con éxito! 🍾" });
    });
});

// 🗑️ DELETE: Eliminar un producto de forma independiente
app.delete('/api/productos/:id', (req, res) => {
    db.query("DELETE FROM productos WHERE id_producto = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Producto eliminado con éxito" });
    });
});

// 🚀 POST MASIVO INTELIGENTE: Validación por software (Ideal para tus datos con duplicados de prueba)
app.post('/api/productos/importar-masivo', async (req, res) => {
    const productos = req.body;

    if (!Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({ error: "El formato de datos no es válido o está vacío." });
    }

    console.time("⏱️ Tiempo de Inserción Masiva");

    // Traemos lo que ya está en la BD para comparar en memoria y no generar errores de llaves
    db.query("SELECT id_producto, nombre_producto, stock FROM productos", async (err, resultadosBD) => {
        if (err) return res.status(500).json({ error: err.message });

        // Mapeamos los productos existentes usando letras minúsculas para evitar fallos por mayúsculas
        const mapaProductos = {};
        resultadosBD.forEach(p => {
            if (p.nombre_producto) {
                mapaProductos[p.nombre_producto.toLowerCase().trim()] = p;
            }
        });

        let insertados = 0;
        let actualizados = 0;

        try {
            const promesas = productos.map(p => {
                const nombreExcel = (p.nombre || p.nombre_producto || "Sin nombre").toString().trim();
                const nombreKey = nombreExcel.toLowerCase();
                const categoria = p.categoria || "General";
                const precio = parseFloat(p.precio) || 0;
                const stockNuevo = parseInt(p.stock) || 0;
                const descripcion = p.descripcion || null;

                if (mapaProductos[nombreKey]) {
                    // 🔄 YA EXISTE: Sumamos stock y pisamos el precio
                    actualizados++;
                    const idExistente = mapaProductos[nombreKey].id_producto;
                    return new Promise((resolve, reject) => {
                        db.query(
                            "UPDATE productos SET stock = stock + ?, precio = ?, categoria = ? WHERE id_producto = ?",
                            [stockNuevo, precio, categoria, idExistente],
                            (err) => err ? reject(err) : resolve()
                        );
                    });
                } else {
                    // ➕ NO EXISTE: Hacemos una inserción limpia de la fila
                    insertados++;
                    return new Promise((resolve, reject) => {
                        db.query(
                            "INSERT INTO productos (nombre_producto, categoria, precio, stock, imagen, descripcion) VALUES (?, ?, ?, ?, ?, ?)",
                            [nombreExcel, categoria, precio, stockNuevo, p.imagen || null, descripcion],
                            (err) => err ? reject(err) : resolve()
                        );
                    });
                }
            });

            await Promise.all(promesas);
            console.timeEnd("⏱️ Tiempo de Inserción Masiva");

            res.status(201).json({ 
                message: "Importación masiva completada con éxito", 
                registrosInsertados: insertados,
                registrosActualizados: actualizados,
                totalAfectados: insertados + actualizados
            });

        } catch (error) {
            console.timeEnd("⏱️ Tiempo de Inserción Masiva");
            console.error("❌ Error procesando el lote:", error.message);
            return res.status(500).json({ error: error.message });
        }
    });
});

// ==========================================
// 3. VENTAS Y DETALLES (REGLA DE ORO: INGRESOS 💰)
// ==========================================
app.post('/api/ventas', (req, res) => {
    db.query("SELECT id_turno FROM control_caja WHERE estado = 'abierto' LIMIT 1", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length === 0) {
            return res.status(403).json({ error: "Operación bloqueada. La caja se encuentra CERRADA. Debe realizar la apertura de caja para operar." });
        }

        const { id_usuario, id_cliente, total_venta, carrito } = req.body;
        const clienteId = id_cliente || 1;

        db.query("INSERT INTO ventas (id_usuario, id_cliente, total_venta) VALUES (?, ?, ?)", 
        [id_usuario, clienteId, total_venta], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            const id_venta = result.insertId;
            
            const queries = carrito.map(item => {
                return new Promise((resolve, reject) => {
                    db.query("INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)", 
                    [id_venta, item.id, item.cantidad, item.precio], (err) => {
                        if (err) reject(err);
                        db.query("UPDATE productos SET stock = stock - ? WHERE id_producto = ?", [item.cantidad, item.id], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                });
            });

            Promise.all(queries)
                .then(() => res.status(201).json({ message: "Venta registrada con éxito", id_venta }))
                .catch(error => res.status(500).json({ error: error.message }));
        });
    });
});

app.get('/api/ventas', (req, res) => {
    const sql = `
        SELECT 
            v.id_venta AS id, 
            v.total_venta AS total, 
            v.fecha AS fecha, 
            IFNULL(u.nombre, 'Sistema') AS cajero, 
            IFNULL(c.nombre, 'Cliente General') AS cliente
        FROM ventas v
        LEFT JOIN usuarios u ON v.id_usuario = u.id_usuario
        LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
        ORDER BY v.id_venta DESC
    `;
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});

app.get('/api/ventas/:id/detalle', (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT dv.cantidad, dv.precio_unitario AS precio, p.nombre_producto AS nombre
        FROM detalle_ventas dv
        JOIN productos p ON dv.id_producto = p.id_producto
        WHERE dv.id_venta = ?
    `;
    db.query(sql, [id], (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});

// ==========================================
// 4. GASTOS (REGLA DE ORO: EGRESOS 📉)
// ==========================================
app.get('/api/gastos', (req, res) => {
    db.query("SELECT * FROM gastos ORDER BY fecha DESC", (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});

app.post('/api/gastos', (req, res) => {
    db.query("SELECT id_turno FROM control_caja WHERE estado = 'abierto' LIMIT 1", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length === 0) {
            return res.status(403).json({ error: "Operación bloqueada. La caja se encuentra CERRADA. Debe realizar la apertura de caja para operar." });
        }

        const { descripcion, monto, categoria } = req.body;
        db.query("INSERT INTO gastos (descripcion, monto, categoria) VALUES (?, ?, ?)", 
        [descripcion, monto, categoria || 'General'], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: "Gasto registrado", id: result.insertId });
        });
    });
});

// ==========================================
// 5. CLIENTES
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
// 6. COMPRAS (REGLA DE ORO: EGRESOS E INVERSIÓN 📦)
// ==========================================
app.get('/api/compras', (req, res) => {
    const sql = `
        SELECT 
            id_compra AS id, 
            id_usuario, 
            total_compra AS total, 
            fecha_compra AS fecha 
        FROM compras 
        ORDER BY fecha_compra DESC
    `;
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});
 
app.get('/api/compras/:id/detalle', (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT 
            dc.cantidad, 
            dc.precio_costo, 
            p.nombre_producto AS nombre
        FROM detalle_compras dc
        JOIN productos p ON dc.id_producto = p.id_producto
        WHERE dc.id_compra = ?
    `;
    db.query(sql, [id], (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});

app.post('/api/compras', (req, res) => {
    db.query("SELECT id_turno FROM control_caja WHERE estado = 'abierto' LIMIT 1", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length === 0) {
            return res.status(403).json({ error: "Operación bloqueada. La caja se encuentra CERRADA. Debe realizar la apertura de caja para operar." });
        }

        const { id_usuario, total_compra, carrito } = req.body;

        const sqlCompra = "INSERT INTO compras (id_usuario, total_compra) VALUES (?, ?)";
        db.query(sqlCompra, [id_usuario, total_compra], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            
            const id_compra = result.insertId;

            if (!carrito || carrito.length === 0) {
                return res.status(201).json({ message: "Compra registrada sin detalles", id_compra });
            }
            
            const queries = carrito.map(item => {
                return new Promise((resolve, reject) => {
                    const idProducto = item.id_producto || item.id;
                    const precioCosto = item.precio_costo || 0;

                    const sqlDetalle = "INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_costo) VALUES (?, ?, ?, ?)";
                    db.query(sqlDetalle, [id_compra, idProducto, item.cantidad, precioCosto], (err) => {
                        if (err) return reject(err);
                        
                        const sqlStock = "UPDATE productos SET stock = stock + ? WHERE id_producto = ?";
                        db.query(sqlStock, [item.cantidad, idProducto], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                });
            });

            Promise.all(queries)
                .then(() => res.status(201).json({ message: "Compra guardada y stock incrementado en base de datos 📦", id_compra }))
                .catch(error => res.status(500).json({ error: error.message }));
        });
    });
});

// ==========================================
// 7. DASHBOARD (REGLA DE ORO INTEGRADA DE RAÍZ 📊)
// ==========================================
app.get('/api/dashboard', async (req, res) => {
    try {
        const getVentas = new Promise((resolve) => db.query("SELECT SUM(total_venta) AS total FROM ventas", (err, data) => resolve(data[0]?.total || 0)));
        const getCompras = new Promise((resolve) => db.query("SELECT SUM(total_compra) AS total FROM compras", (err, data) => resolve(data[0]?.total || 0)));
        const getGastos = new Promise((resolve) => db.query("SELECT SUM(monto) AS total FROM gastos", (err, data) => resolve(data[0]?.total || 0)));
        const getProductos = new Promise((resolve) => db.query("SELECT COUNT(*) AS total FROM productos", (err, data) => resolve(data[0]?.total || 0)));

        const [ventasTotales, comprasTotales, gastosTotales, licoresCatalogo] = await Promise.all([getVentas, getCompras, getGastos, getProductos]);

        const ingresos = Number(ventasTotales);
        const egresos = Number(comprasTotales) + Number(gastosTotales);
        const balanceNeto = ingresos - egresos;

        res.json({
            ingresos: ingresos,
            egresos: egresos,
            balanceNeto: balanceNeto,
            ventasTotales: ingresos,
            comprasTotales: Number(comprasTotales),
            gastosTotales: Number(gastosTotales),
            licoresCatalogo: Number(licoresCatalogo)
        });
    } catch (error) {
        res.status(500).json({ error: "Error calculando el balance financiero del negocio" });
    }
});

// ==========================================
// 8. CONTROL Y ARQUEO DE CAJA (REGLA DE ORO EMPOSTADA 🔑)
// ==========================================
app.get('/api/caja/estado', (req, res) => {
    db.query("SELECT * FROM control_caja WHERE estado = 'abierto' ORDER BY id_turno DESC LIMIT 1", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) {
            return res.json({ estado: "cerrado", info: null });
        }

        const cajaActiva = result[0];
        const fechaApertura = cajaActiva.fecha_apertura;

        const qVentas = new Promise((resolve) => db.query("SELECT SUM(total_venta) AS total FROM ventas WHERE fecha >= ?", [fechaApertura], (err, d) => resolve(Number(d[0]?.total || 0))));
        const qCompras = new Promise((resolve) => db.query("SELECT SUM(total_compra) AS total FROM compras WHERE fecha_compra >= ?", [fechaApertura], (err, d) => resolve(Number(d[0]?.total || 0))));
        const qGastos = new Promise((resolve) => db.query("SELECT SUM(monto) AS total FROM gastos WHERE fecha >= ?", [fechaApertura], (err, d) => resolve(Number(d[0]?.total || 0))));

        Promise.all([qVentas, qCompras, qGastos]).then(([ventas, compras, gastos]) => {
            const base = Number(cajaActiva.monto_inicial);
            const esperado = base + ventas - compras - gastos; 

            res.json({
                estado: "abierto",
                info: {
                    id_turno: cajaActiva.id_turno,
                    id_usuario: cajaActiva.id_usuario,
                    fecha_apertura: fechaApertura,
                    monto_inicial: base,
                    monto_ventas: ventas,
                    monto_compras: compras,
                    monto_gastos: gastos,
                    monto_final_esperado: esperado
                }
            });
        });
    });
});

app.post('/api/caja/abrir', (req, res) => {
    const { id_usuario, monto_inicial } = req.body;

    db.query("SELECT id_turno FROM control_caja WHERE estado = 'abierto'", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length > 0) return res.status(400).json({ error: "Ya existe un turno de caja abierto actualmente." });

        const sql = "INSERT INTO control_caja (id_usuario, monto_inicial, estado) VALUES (?, ?, 'abierto')";
        db.query(sql, [id_usuario, monto_inicial || 0], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: "Caja abierta con éxito. ¡Buen turno de ventas! 💰", id_turno: result.insertId });
        });
    });
});

app.post('/api/caja/cerrar', (req, res) => {
    const { id_turno, monto_final_real } = req.body;

    db.query("SELECT * FROM control_caja WHERE id_turno = ?", [id_turno], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length === 0) return res.status(404).json({ error: "Turno no encontrado." });

        const caja = rows[0];
        const fechaApertura = caja.fecha_apertura;

        const qVentas = new Promise((resolve) => db.query("SELECT SUM(total_venta) AS total FROM ventas WHERE fecha >= ?", [fechaApertura], (err, d) => resolve(Number(d[0]?.total || 0))));
        const qCompras = new Promise((resolve) => db.query("SELECT SUM(total_compra) AS total FROM compras WHERE fecha_compra >= ?", [fechaApertura], (err, d) => resolve(Number(d[0]?.total || 0))));
        const qGastos = new Promise((resolve) => db.query("SELECT SUM(monto) AS total FROM gastos WHERE fecha >= ?", [fechaApertura], (err, d) => resolve(Number(d[0]?.total || 0))));

        Promise.all([qVentas, qCompras, qGastos]).then(([ventas, compras, gastos]) => {
            const base = Number(caja.monto_inicial);
            const real = Number(monto_final_real || 0);
            
            const esperado = base + ventas - compras - gastos; 
            const diferencia = real - esperado;

            const sqlCierre = `
                UPDATE control_caja 
                SET fecha_cierre = CURRENT_TIMESTAMP,
                    monto_ventas = ?,
                    monto_compras = ?,
                    monto_gastos = ?,
                    monto_final_esperado = ?,
                    monto_final_real = ?,
                    diferencia = ?,
                    estado = 'cerrado'
                WHERE id_turno = ?
            `;

            db.query(sqlCierre, [ventas, compras, gastos, esperado, real, diferencia, id_turno], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                
                res.json({
                    message: "Caja cerrada y turno finalizado correctamente 🏁",
                    resumen: {
                        efectivoEsperado: esperado,
                        efectivoRealContado: real,
                        descuadre: diferencia
                    }
                });
            });
        });
    });
});

// --- 9. LEVANTAMIENTO DEL SERVIDOR ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});