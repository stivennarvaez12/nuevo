const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ msg: 'No hay token' });
  }

  try {
    const decoded = jwt.verify(token, 'CLAVE_SECRETA');
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ msg: 'Token inválido' });
  }
};

module.exports = verificarToken;