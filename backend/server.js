const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos de Angular
app.use(express.static(path.join(__dirname, '../frontend/dist/frontend')));

// Rutas de la API
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'API funcionando correctamente',
    uptime: process.uptime()
  });
});

app.get('/api/usuarios', (req, res) => {
  res.json([
    { id: 1, nombre: 'Usuario Ejemplo', email: 'usuario@ejemplo.com' }
  ]);
});

// Ruta catch-all para servir la app de Angular
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/frontend/index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
