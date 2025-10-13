const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const config = require('../../config');

function generarToken(usuario) {
  return jwt.sign(
    { id: usuario._id, email: usuario.email, rol: usuario.rol },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

async function registro(req, res) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errors: errores.array() });
  }

  const { nombre, email, password, rol } = req.body;
  const existe = await User.findOne({ email });
  if (existe) return res.status(409).json({ error: 'Email ya registrado' });

  const usuario = new User({ nombre, email, password, rol });
  await usuario.save();

  const token = generarToken(usuario);
  return res.status(201).json({
    message: 'Usuario registrado correctamente',
    user: { id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    token,
  });
}

async function login(req, res) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errors: errores.array() });
  }
  const { email, password } = req.body;
  const usuario = await User.findOne({ email, activo: true });
  if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });

  const ok = await usuario.compararPassword(password);
  if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = generarToken(usuario);
  return res.json({
    message: 'Login exitoso',
    user: { id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    token,
  });
}

module.exports = { registro, login };


