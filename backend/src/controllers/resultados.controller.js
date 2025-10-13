const { validationResult } = require('express-validator');
const Resultado = require('../models/Resultado.model');

async function crearResultado(req, res) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) return res.status(400).json({ errors: errores.array() });
  const resultado = new Resultado(req.body);
  await resultado.save();
  return res.status(201).json(resultado);
}

async function listarResultados(req, res) {
  const filtro = {};
  if (req.query.paciente) filtro.paciente = req.query.paciente;
  const resultados = await Resultado.find(filtro).populate('paciente');
  return res.json(resultados);
}

async function obtenerResultado(req, res) {
  const resultado = await Resultado.findById(req.params.id).populate('paciente');
  if (!resultado) return res.status(404).json({ error: 'Resultado no encontrado' });
  return res.json(resultado);
}

async function actualizarResultado(req, res) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) return res.status(400).json({ errors: errores.array() });
  const resultado = await Resultado.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!resultado) return res.status(404).json({ error: 'Resultado no encontrado' });
  return res.json(resultado);
}

async function eliminarResultado(req, res) {
  const eliminado = await Resultado.findByIdAndDelete(req.params.id);
  if (!eliminado) return res.status(404).json({ error: 'Resultado no encontrado' });
  return res.json({ message: 'Resultado eliminado' });
}

module.exports = { crearResultado, listarResultados, obtenerResultado, actualizarResultado, eliminarResultado };


