const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const config = require('./config');
const { connectToDatabase } = require('./src/database');

const authRoutes = require('./src/routes/auth.routes');
const pacientesRoutes = require('./src/routes/pacientes.routes');
const citasRoutes = require('./src/routes/citas.routes');
const resultadosRoutes = require('./src/routes/resultados.routes');
const alertasRoutes = require('./src/routes/alertas.routes');

const app = express();
const PORT = config.port;

// Seguridad y utilidades
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());

// CORS
app.use(cors(config.cors));

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a BD
connectToDatabase().catch((err) => {
  console.error('Error conectando a la base de datos:', err);
  process.exit(1);
});



// Rutas básicas
app.get('/', (req, res) => {
  res.json({
    message: 'Servidor SaludVital funcionando correctamente',
    version: '1.0.0',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// Rutas de la API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API funcionando correctamente',
    uptime: process.uptime()
  });
});

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/resultados', resultadosRoutes);
app.use('/api/alertas', alertasRoutes);

// Ruta catch-all para servir la app de Angular
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/frontend/index.html'));
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: 'Error interno del servidor',
    message: err.message || 'Ocurrió un error inesperado'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;