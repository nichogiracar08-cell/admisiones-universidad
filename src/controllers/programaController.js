const Programa = require('../models/Programa');
const Facultad = require('../models/Facultad');
const Estudiante = require('../models/Estudiante');
const { asyncHandler, httpError } = require('../middlewares/errores');

// GET /api/programas?facultad=<id>&nivel=Pregrado&activo=true
const listar = asyncHandler(async (req, res) => {
  const filtro = {};
  if (req.query.facultad) filtro.facultad = req.query.facultad;
  if (req.query.nivel) filtro.nivel = req.query.nivel;
  if (req.query.modalidad) filtro.modalidad = req.query.modalidad;
  if (req.query.activo !== undefined) filtro.activo = req.query.activo === 'true';

  const programas = await Programa.find(filtro).populate('facultad', 'nombre codigo').sort('nombre');
  res.json({ ok: true, total: programas.length, data: programas });
});

// GET /api/programas/:id
const obtener = asyncHandler(async (req, res) => {
  const programa = await Programa.findById(req.params.id).populate('facultad');
  if (!programa) throw httpError(404, 'Programa no encontrado');
  const inscritos = await Estudiante.countDocuments({ programa: programa._id });
  res.json({ ok: true, data: { ...programa.toObject(), inscritos } });
});

// POST /api/programas
const crear = asyncHandler(async (req, res) => {
  const existeFacultad = await Facultad.exists({ _id: req.body.facultad });
  if (!existeFacultad) throw httpError(400, 'La facultad indicada no existe');
  const programa = await Programa.create(req.body);
  res.status(201).json({ ok: true, mensaje: 'Programa creado', data: programa });
});

// PUT /api/programas/:id
const actualizar = asyncHandler(async (req, res) => {
  if (req.body.facultad && !(await Facultad.exists({ _id: req.body.facultad }))) {
    throw httpError(400, 'La facultad indicada no existe');
  }
  const programa = await Programa.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('facultad', 'nombre codigo');
  if (!programa) throw httpError(404, 'Programa no encontrado');
  res.json({ ok: true, mensaje: 'Programa actualizado', data: programa });
});

// DELETE /api/programas/:id
const eliminar = asyncHandler(async (req, res) => {
  const estudiantes = await Estudiante.countDocuments({ programa: req.params.id });
  if (estudiantes > 0) {
    throw httpError(409, `No se puede eliminar: el programa tiene ${estudiantes} estudiante(s) inscritos`);
  }
  const programa = await Programa.findByIdAndDelete(req.params.id);
  if (!programa) throw httpError(404, 'Programa no encontrado');
  res.json({ ok: true, mensaje: 'Programa eliminado' });
});

module.exports = { listar, obtener, crear, actualizar, eliminar };
