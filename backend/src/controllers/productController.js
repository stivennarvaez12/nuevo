const pool = require('../config/db');

// 🔹 Obtener todos los productos (Ajustado para el Frontend)
exports.getProductos = async (req, res) => {
    try {
        // Usamos AS para que React reciba exactamente "id" y "nombre"
        const [rows] = await pool.query(
            'SELECT id_producto AS id, nombre_producto AS nombre, categoria, descripcion, precio, stock, estado FROM productos'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error en getProductos:', error);
        res.status(500).json({ msg: 'Error al obtener productos', error });
    }
};

// 🔹 Crear un nuevo producto (Añadida la Categoría)
exports.createProducto = async (req, res) => {
    try {
        // Recibimos "nombre" desde el frontend, pero lo guardamos en "nombre_producto" en la DB
        const { nombre, categoria, descripcion, precio, stock } = req.body;
        
        await pool.query(
            'INSERT INTO productos (nombre_producto, categoria, descripcion, precio, stock) VALUES (?, ?, ?, ?, ?)',
            [nombre, categoria, descripcion, precio, stock]
        );
        res.json({ msg: 'Producto creado exitosamente' });
    } catch (error) {
        console.error('Error en createProducto:', error);
        res.status(500).json({ msg: 'Error al crear producto', error });
    }
};

// 🔹 Eliminar un producto
exports.deleteProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM productos WHERE id_producto = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'El producto no existe' });
        }

        res.json({ msg: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error('Error en deleteProducto:', error);
        res.status(500).json({ msg: 'Error al eliminar producto', error });
    }
};

// 🔹 Actualizar un producto (Añadida la Categoría)
exports.updateProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, categoria, descripcion, precio, stock } = req.body;
        
        const [result] = await pool.query(
            'UPDATE productos SET nombre_producto = ?, categoria = ?, descripcion = ?, precio = ?, stock = ? WHERE id_producto = ?',
            [nombre, categoria, descripcion, precio, stock, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'El producto no existe para actualizar' });
        }

        res.json({ msg: 'Producto actualizado exitosamente' });
    } catch (error) {
        console.error('Error en updateProducto:', error);
        res.status(500).json({ msg: 'Error al actualizar producto', error });
    }
};