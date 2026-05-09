const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const verificarToken = require('../middlewares/authMiddleware');

router.post('/login', login);

// 🔒 RUTA PROTEGIDA
router.get('/perfil', verificarToken, (req, res) => {
  res.json({
    msg: 'Acceso permitido',
    usuario: req.usuario
  });
});

module.exports = router;