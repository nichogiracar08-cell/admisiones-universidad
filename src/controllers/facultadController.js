const Facultad = require('../models/Facultad');
const Programa = require('../models/Programa');
const { asyncHandler, httpError } = require('../middlewares/errores');

// GET /api/facultades
const listar = asyncHandler(async (req, res) => {
  const facultades = await Facultad.find().populate('programas', 'nombre codigo nivel').sort('nombre');
  res.json({ ok: true, total: facultades.length, data: facultades });
});

// GET /api/facultades/:id
const obtener = asyncHandler(async (req, res) => {
  const facultad = await Facultad.findById(req.params.id).populate('programas');
  if (!facultad) throw httpError(404, 'Facultad no encontrada');
  res.json({ ok: true, data: facultad });
});

// POST /api/facultades
const crear = asyncHandler(async (req, res) => {
  const facultad = await Facultad.create(req.body);
  res.status(201).json({ ok: true, mensaje: 'Facultad creada', data: facultad });
});

// PUT /api/facultades/:id
const actualizar = asyncHandler(async (req, res) => {
  const facultad = await Facultad.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!facultad) throw httpError(404, 'Facultad no encontrada');
  res.json({ ok: true, mensaje: 'Facultad actualizada', data: facultad });
});

// DELETE /api/facultades/:id
const eliminar = asyncHandler(async (req, res) => {
  const programas = await Programa.countDocuments({ facultad: req.params.id });
  if (programas > 0) {
    throw httpError(409, `No se puede eliminar: la facultad tiene ${programas} programa(s) asociados`);
  }
  const facultad = await Facultad.findByIdAndDelete(req.params.id);
  if (!facultad) throw httpError(404, 'Facultad no encontrada');
  res.json({ ok: true, mensaje: 'Facultad eliminada' });
});

module.exports = { listar, obtener, crear, actualizar, eliminar };
