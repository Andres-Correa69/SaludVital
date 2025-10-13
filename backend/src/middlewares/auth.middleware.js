const jwt = require('jsonwebtoken');
const config = require('../../config');

/**
 * Middleware para verificar JWT en Authorization: Bearer <token>
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'No autorizado', message: 'Token no provisto' });
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'No autorizado', message: 'Token inválido o expirado' });
  }
}

module.exports = { authMiddleware };


