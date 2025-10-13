const mongoose = require('mongoose');

const AlertaSchema = new mongoose.Schema(
  {
    paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente', required: true, index: true },
    titulo: { type: String, required: true },
    mensaje: { type: String, required: true },
    prioridad: { type: String, enum: ['baja', 'media', 'alta'], default: 'media' },
    leida: { type: Boolean, default: false },
    fechaProgramada: { type: Date, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alerta', AlertaSchema);


