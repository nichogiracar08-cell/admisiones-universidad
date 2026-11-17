const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { noEncontrado, manejadorErrores } = require('./middlewares/errores');
const { resumen } = require('./controllers/estadisticasController');
const { proteger } = require('./middlewares/auth');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Frontend (página de admisiones)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rutas de la API
app.get('/api', (req, res) =>
  res.json({
    ok: true,
    mensaje: 'API de Admisiones Universitarias',
    endpoints: ['/api/auth/login', '/api/auth/registro', '/api/facultades', '/api/programas', '/api/estudiantes', '/api/estadisticas'],
  })
);
// Autenticación (pública: registro y login)
app.use('/api/auth', require('./routes/authRoutes'));

// Todo lo demás requiere haber iniciado sesión
app.use('/api/facultades', proteger, require('./routes/facultadRoutes'));
app.use('/api/programas', proteger, require('./routes/programaRoutes'));
app.use('/api/estudiantes', proteger, require('./routes/estudianteRoutes'));
app.get('/api/estadisticas', proteger, resumen);

// Errores
app.use('/api', noEncontrado);
app.use(manejadorErrores);

module.exports = app;
