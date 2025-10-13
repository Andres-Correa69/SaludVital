const mongoose = require('mongoose');

const ResultadoSchema = new mongoose.Schema(
  {
    paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente', required: true, index: true },
    tipo: { type: String, required: true },
    descripcion: { type: String, required: true },
    archivoUrl: { type: String, required: false },
    fechaResultado: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resultado', ResultadoSchema);


