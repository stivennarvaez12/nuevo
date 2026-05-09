const express = require('express');
const router = express.Router();
const {
    getProductos,
    createProducto,
    deleteProducto,
    updateProducto
} = require('../controllers/productController');

// --- Rutas libres para desarrollo del Frontend ---
router.get('/', getProductos);
router.post('/', createProducto);
router.delete('/:id', deleteProducto);
router.put('/:id', updateProducto);

module.exports = router;