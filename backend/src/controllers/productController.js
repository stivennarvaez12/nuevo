const pool = require('../config/db');

// 🔹 Obtener todos los productos (Ajustado para el Frontend con Logs)
exports.getProductos = async (req, res) => {
    try {
        console.log('📡 Intentando obtener productos de la base de datos...');
        
        // Ejecutamos la consulta. Usamos AS para que el frontend reciba "id" y "nombre"
        const [rows] = await pool.query(
            'SELECT id_producto AS id, nombre_producto AS nombre, categoria, descripcion, precio, stock, estado FROM productos'
        );

        console.log(`✅ Consulta exitosa: ${rows.length} productos encontrados.`);
        
        // Enviamos los resultados al frontend
        res.json(rows);
    } catch (error) {
        console.error('❌ Error en getProductos:', error.message);
        res.status(500).json({ 
            msg: 'Error al obtener productos', 
            error: error.message 
        });
    }
};

// 🔹 Crear un nuevo producto
exports.createProducto = async (req, res) => {
    try {
        const { nombre, categoria, descripcion, precio, stock } = req.body;
        
        console.log('📝 Intentando crear nuevo producto:', nombre);

        const [result] = await pool.query(
            'INSERT INTO productos (nombre_producto, categoria, descripcion, precio, stock) VALUES (?, ?, ?, ?, ?)',
            [nombre, categoria, descripcion, precio, stock]
        );

        console.log('✅ Producto creado con ID:', result.insertId);
        res.json({ msg: 'Producto creado exitosamente', id: result.insertId });
    } catch (error) {
        console.error('❌ Error en createProducto:', error.message);
        res.status(500).json({ 
            msg: 'Error al crear producto', 
            error: error.message 
        });
    }
};

// 🔹 Eliminar un producto
exports.deleteProducto = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🗑️ Intentando eliminar producto con ID:', id);

        const [result] = await pool.query('DELETE FROM productos WHERE id_producto = ?', [id]);

        if (result.affectedRows === 0) {
            console.log('⚠️ No se encontró el producto para eliminar.');
            return res.status(404).json({ msg: 'El producto no existe' });
        }

        console.log('✅ Producto eliminado exitosamente.');
        res.json({ msg: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error('❌ Error en deleteProducto:', error.message);
        res.status(500).json({ 
            msg: 'Error al eliminar producto', 
            error: error.message 
        });
    }
};

// 🔹 Actualizar un producto
exports.updateProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, categoria, descripcion, precio, stock } = req.body;
        
        console.log('🆙 Intentando actualizar producto con ID:', id);

        const [result] = await pool.query(
            'UPDATE productos SET nombre_producto = ?, categoria = ?, descripcion = ?, precio = ?, stock = ? WHERE id_producto = ?',
            [nombre, categoria, descripcion, precio, stock, id]
        );

        if (result.affectedRows === 0) {
            console.log('⚠️ El producto no existe para actualizar.');
            return res.status(404).json({ msg: 'El producto no existe para actualizar' });
        }

        console.log('✅ Producto actualizado exitosamente.');
        res.json({ msg: 'Producto actualizado exitosamente' });
    } catch (error) {
        console.error('❌ Error en updateProducto:', error.message);
        res.status(500).json({ 
            msg: 'Error al actualizar producto', 
            error: error.message 
        });
    }
};