const mongoose = require('mongoose');
const config = require('../config');

/**
 * Establece la conexión con MongoDB usando Mongoose.
 * Reutiliza la conexión si ya existe.
 */
async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  mongoose.set('strictQuery', true);

  await mongoose.connect(config.mongoUri, {
    autoIndex: true,
  });

  mongoose.connection.on('connected', () => {
    console.log('📦 Conectado a MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ Error de MongoDB:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  Desconectado de MongoDB');
  });

  return mongoose.connection;
}

module.exports = { connectToDatabase };


