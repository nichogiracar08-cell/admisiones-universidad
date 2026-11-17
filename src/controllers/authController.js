const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const Sesion = require('../models/Sesion');
const { asyncHandler, httpError } = require('../middlewares/errores');

const HORAS_SESION = 8;

const publico = (u) => ({ id: u._id, nombre: u.nombre, email: u.email, rol: u.rol });

// Crea el JWT y registra la sesión en la base de datos
const abrirSesion = async (usuario, req) => {
  const tokenId = crypto.randomUUID();
  const token = jwt.sign({ sub: usuario._id.toString(), rol: usuario.rol, jti: tokenId }, process.env.JWT_SECRET, {
    expiresIn: `${HORAS_SESION}h`,
  });
  await Sesion.create({
    usuario: usuario._id,
    tokenId,
    ip: req.ip,
    navegador: req.headers['user-agent'],
    expiraEn: new Date(Date.now() + HORAS_SESION * 3600 * 1000),
  });
  usuario.ultimoAcceso = new Date();
  await usuario.save();
  return token;
};

// POST /api/auth/registro
const registro = asyncHandler(async (req, res) => {
  const { nombre, email, password } = req.body;
  // Los usuarios nuevos siempre son "asesor"; el admin se crea con el seed
  const usuario = await Usuario.create({ nombre, email, password });
  const token = await abrirSesion(usuario, req);
  res.status(201).json({ ok: true, mensaje: 'Cuenta creada', token, usuario: publico(usuario) });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(400, 'Email y contraseña son obligatorios');

  const usuario = await Usuario.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!usuario || !(await usuario.compararPassword(password))) {
    throw httpError(401, 'Credenciales incorrectas');
  }
  if (!usuario.activo) throw httpError(403, 'Usuario desactivado');

  const token = await abrirSesion(usuario, req);
  res.json({ ok: true, mensaje: `Bienvenido, ${usuario.nombre}`, token, usuario: publico(usuario) });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  req.sesion.activa = false;
  req.sesion.cerradaEn = new Date();
  await req.sesion.save();
  res.json({ ok: true, mensaje: 'Sesión cerrada' });
});

// GET /api/auth/perfil
const perfil = asyncHandler(async (req, res) => {
  res.json({ ok: true, usuario: publico(req.usuario) });
});

// GET /api/auth/sesiones  (historial de inicios de sesión del usuario)
const misSesiones = asyncHandler(async (req, res) => {
  const sesiones = await Sesion.find({ usuario: req.usuario._id }).sort('-createdAt').limit(20);
  res.json({ ok: true, data: sesiones });
});

module.exports = { registro, login, logout, perfil, misSesiones };
