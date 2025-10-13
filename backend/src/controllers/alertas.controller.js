const { validationResult } = require('express-validator');
const Alerta = require('../models/Alerta.model');

async function crearAlerta(req, res) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) return res.status(400).json({ errors: errores.array() });
  const alerta = new Alerta(req.body);
  await alerta.save();
  return res.status(201).json(alerta);
}

async function listarAlertas(req, res) {
  const filtro = {};
  if (req.query.paciente) filtro.paciente = req.query.paciente;
  const alertas = await Alerta.find(filtro).populate('paciente');
  return res.json(alertas);
}

async function obtenerAlerta(req, res) {
  const alerta = await Alerta.findById(req.params.id).populate('paciente');
  if (!alerta) return res.status(404).json({ error: 'Alerta no encontrada' });
  return res.json(alerta);
}

async function actualizarAlerta(req, res) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) return res.status(400).json({ errors: errores.array() });
  const alerta = await Alerta.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!alerta) return res.status(404).json({ error: 'Alerta no encontrada' });
  return res.json(alerta);
}

async function eliminarAlerta(req, res) {
  const eliminado = await Alerta.findByIdAndDelete(req.params.id);
  if (!eliminado) return res.status(404).json({ error: 'Alerta no encontrada' });
  return res.json({ message: 'Alerta eliminada' });
}

module.exports = { crearAlerta, listarAlertas, obtenerAlerta, actualizarAlerta, eliminarAlerta };


