const mongoose = require('mongoose');

const PacienteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    documento: { type: String, required: true, unique: true },
    telefono: { type: String, required: true },
    direccion: { type: String, required: true },
    fechaNacimiento: { type: Date, required: true },
    grupoSanguineo: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Paciente', PacienteSchema);


