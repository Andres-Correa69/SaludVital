const { validationResult } = require('express-validator');
const Cita = require('../models/Cita.model');

async function crearCita(req, res) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) return res.status(400).json({ errors: errores.array() });
  const cita = new Cita(req.body);
  await cita.save();
  return res.status(201).json(cita);
}

async function listarCitas(req, res) {
  const filtro = {};
  if (req.query.paciente) filtro.paciente = req.query.paciente;
  const citas = await Cita.find(filtro).populate('paciente');
  return res.json(citas);
}

async function obtenerCita(req, res) {
  const cita = await Cita.findById(req.params.id).populate('paciente');
  if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });
  return res.json(cita);
}

async function actualizarCita(req, res) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) return res.status(400).json({ errors: errores.array() });
  const cita = await Cita.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });
  return res.json(cita);
}

async function eliminarCita(req, res) {
  const eliminado = await Cita.findByIdAndDelete(req.params.id);
  if (!eliminado) return res.status(404).json({ error: 'Cita no encontrada' });
  return res.json({ message: 'Cita eliminada' });
}

module.exports = { crearCita, listarCitas, obtenerCita, actualizarCita, eliminarCita };


