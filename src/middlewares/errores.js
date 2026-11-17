// Envuelve controladores async para mandar los errores al manejador central
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const noEncontrado = (req, res) => {
  res.status(404).json({ ok: false, mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
const manejadorErrores = (err, req, res, next) => {
  let status = err.status || 500;
  let mensaje = err.message || 'Error interno del servidor';

  if (err.name === 'ValidationError') {
    status = 400;
    mensaje = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.name === 'CastError') {
    status = 400;
    mensaje = `Valor inválido para ${err.path}: ${err.value}`;
  } else if (err.code === 11000) {
    status = 409;
    const campo = Object.keys(err.keyValue || {}).join(', ');
    mensaje = `Ya existe un registro con ese ${campo}`;
  }

  if (status === 500) console.error(err);
  res.status(status).json({ ok: false, mensaje });
};

// Crea un error con código HTTP
const httpError = (status, mensaje) => Object.assign(new Error(mensaje), { status });

module.exports = { asyncHandler, noEncontrado, manejadorErrores, httpError };
