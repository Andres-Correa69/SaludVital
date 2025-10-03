const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas básicas
app.get('/', (req, res) => {
  res.json({ 
    message: 'Servidor SaludVital funcionando correctamente',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'API funcionando correctamente',
    uptime: process.uptime()
  });
});

// Ruta de ejemplo para la API
app.get('/api/usuarios', (req, res) => {
  res.json([
    { id: 1, nombre: 'Usuario Ejemplo', email: 'usuario@ejemplo.com' }
  ]);
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe`
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
