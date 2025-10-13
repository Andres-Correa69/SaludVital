// Configuración centralizada de la aplicación
// Variables de entorno esperadas:
// - PORT
// - NODE_ENV
// - CORS_ORIGIN
// - MONGO_URI
// - JWT_SECRET
// - JWT_EXPIRES_IN

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    credentials: true
  },
  mongoUri: process.env.MONGO_URI || 'mongodb+srv://SaludVital2025:SaludVital2025@saludvital2025.84asiyq.mongodb.net/saludvital',
  jwt: {
    secret: process.env.JWT_SECRET || 'change_this_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  }
};
