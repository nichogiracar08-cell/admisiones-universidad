const jwt = require('jsonwebtoken');
const Sesion = require('../models/Sesion');
const Usuario = require('../models/Usuario');
const { asyncHandler, httpError } = require('./errores');

// Verifica el token "Authorization: Bearer <token>" y que la sesión siga activa
const proteger = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw httpError(401, 'Debes iniciar sesión');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw httpError(401, 'Token inválido o expirado');
  }

  const sesion = await Sesion.findOne({ tokenId: payload.jti, activa: true });
  if (!sesion) throw httpError(401, 'La sesión fue cerrada, vuelve a iniciar sesión');

  const usuario = await Usuario.findById(payload.sub);
  if (!usuario || !usuario.activo) throw httpError(401, 'Usuario no autorizado');

  req.usuario = usuario;
  req.sesion = sesion;
  next();
});

// Restringe por rol: soloRol('admin')
const soloRol = (...roles) => (req, res, next) => {
  if (!roles.includes(req.usuario.rol)) {
    return next(httpError(403, 'No tienes permisos para esta acción'));
  }
  next();
};

module.exports = { proteger, soloRol };
