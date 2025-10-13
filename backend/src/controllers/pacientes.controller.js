const { validationResult } = require('express-validator');
const Paciente = require('../models/Paciente.model');

async function crearPaciente(req, res) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) return res.status(400).json({ errors: errores.array() });
  const paciente = new Paciente(req.body);
  await paciente.save();
  return res.status(201).json(paciente);
}

async function listarPacientes(req, res) {
  const pacientes = await Paciente.find().populate('user', 'nombre email rol');
  return res.json(pacientes);
}

async function obtenerPaciente(req, res) {
  const paciente = await Paciente.findById(req.params.id).populate('user', 'nombre email rol');
  if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });
  return res.json(paciente);
}

async function actualizarPaciente(req, res) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) return res.status(400).json({ errors: errores.array() });
  const paciente = await Paciente.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('user', 'nombre email rol');
  if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });
  return res.json(paciente);
}

async function eliminarPaciente(req, res) {
  const eliminado = await Paciente.findByIdAndDelete(req.params.id);
  if (!eliminado) return res.status(404).json({ error: 'Paciente no encontrado' });
  return res.json({ message: 'Paciente eliminado' });
}

module.exports = { crearPaciente, listarPacientes, obtenerPaciente, actualizarPaciente, eliminarPaciente };


