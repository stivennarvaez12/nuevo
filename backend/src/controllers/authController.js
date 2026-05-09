const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Buscamos el usuario y hacemos un JOIN para traer el nombre del rol
    const [rows] = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.email, u.password, u.estado, r.nombre_rol AS rol 
       FROM usuarios u 
       JOIN roles r ON u.id_rol = r.id_rol 
       WHERE u.email = ?`,
      [email]
    );

    // 2. Verificar si el usuario existe
    if (rows.length === 0) {
      return res.status(401).json({ msg: 'Usuario no existe' });
    }

    const usuario = rows[0];

    // 3. Verificar si el usuario está activo (estado = 1)
    if (usuario.estado === 0) {
      return res.status(403).json({ msg: 'Usuario inactivo. Contacte al administrador.' });
    }

    // 4. Comparar la contraseña ingresada con la encriptada
    const valido = await bcrypt.compare(password, usuario.password);

    if (!valido) {
      return res.status(401).json({ msg: 'Contraseña incorrecta' });
    }

    // 5. Generar el Token (Nota: A futuro, cambia 'CLAVE_SECRETA' por process.env.JWT_SECRET)
    const token = jwt.sign(
      { 
        id: usuario.id_usuario, 
        rol: usuario.rol,
        nombre: usuario.nombre 
      },
      'CLAVE_SECRETA',
      { expiresIn: '2h' }
    );

    // 6. Respondemos con el token y con los datos para el Frontend
    res.json({
      msg: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ msg: 'Error en el servidor', error });
  }
};