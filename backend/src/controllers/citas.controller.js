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
  try {
    console.log('🔍 listarCitas llamado');
    console.log('Query parameters:', req.query);
    
    const filtro = {};
    
    if (req.query.paciente && req.query.paciente.trim() !== '') {
      filtro.paciente = req.query.paciente;
    }
    
    console.log('Filtro aplicado:', filtro);
    
    // Contar total de citas en la BD
    const totalCitas = await Cita.countDocuments();
    console.log(`📊 Total de citas en BD: ${totalCitas}`);
    
    const citas = await Cita.find(filtro).populate('paciente');
    
    console.log(`✅ Citas encontradas con filtro: ${citas.length}`);
    console.log('IDs de citas encontradas:', citas.map(c => c._id));
    
    return res.json(citas);
    
  } catch (error) {
    console.error('❌ Error en listarCitas:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
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


