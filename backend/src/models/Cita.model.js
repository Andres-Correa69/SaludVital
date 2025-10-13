const mongoose = require('mongoose');

const CitaSchema = new mongoose.Schema(
  {
    paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente', required: true, index: true },
    fecha: { type: Date, required: true },
    motivo: { type: String, required: true },
    estado: { type: String, enum: ['pendiente', 'confirmada', 'cancelada', 'completada'], default: 'pendiente' },
    medico: { type: String, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cita', CitaSchema);


