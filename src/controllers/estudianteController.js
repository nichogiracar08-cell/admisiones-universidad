const Estudiante = require('../models/Estudiante');
const Programa = require('../models/Programa');
const { asyncHandler, httpError } = require('../middlewares/errores');

const poblarPrograma = {
  path: 'programa',
  select: 'nombre codigo nivel facultad',
  populate: { path: 'facultad', select: 'nombre codigo' },
};

// GET /api/estudiantes?programa=<id>&estado=Admitido&buscar=texto
const listar = asyncHandler(async (req, res) => {
  const filtro = {};
  if (req.query.programa) filtro.programa = req.query.programa;
  if (req.query.estado) filtro.estadoAdmision = req.query.estado;
  if (req.query.buscar) {
    const regex = new RegExp(req.query.buscar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filtro.$or = [{ nombres: regex }, { apellidos: regex }, { documento: regex }, { email: regex }];
  }

  const estudiantes = await Estudiante.find(filtro).populate(poblarPrograma).sort('-createdAt');
  res.json({ ok: true, total: estudiantes.length, data: estudiantes });
});

// GET /api/estudiantes/:id
const obtener = asyncHandler(async (req, res) => {
  const estudiante = await Estudiante.findById(req.params.id).populate(poblarPrograma);
  if (!estudiante) throw httpError(404, 'Estudiante no encontrado');
  res.json({ ok: true, data: estudiante });
});

// POST /api/estudiantes  (inscripción / solicitud de admisión)
const crear = asyncHandler(async (req, res) => {
  const programa = await Programa.findById(req.body.programa);
  if (!programa) throw httpError(400, 'El programa indicado no existe');
  if (!programa.activo) throw httpError(400, 'El programa no está recibiendo inscripciones');

  // El estado siempre arranca en "Inscrito"
  const { estadoAdmision, ...datos } = req.body;
  const estudiante = await Estudiante.create(datos);
  await estudiante.populate(poblarPrograma);
  res.status(201).json({ ok: true, mensaje: 'Inscripción registrada', data: estudiante });
});

// PUT /api/estudiantes/:id
const actualizar = asyncHandler(async (req, res) => {
  if (req.body.programa && !(await Programa.exists({ _id: req.body.programa }))) {
    throw httpError(400, 'El programa indicado no existe');
  }
  const estudiante = await Estudiante.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate(poblarPrograma);
  if (!estudiante) throw httpError(404, 'Estudiante no encontrado');
  res.json({ ok: true, mensaje: 'Estudiante actualizado', data: estudiante });
});

// PATCH /api/estudiantes/:id/estado   body: { "estadoAdmision": "Admitido" }
const cambiarEstado = asyncHandler(async (req, res) => {
  const { estadoAdmision } = req.body;
  const estudiante = await Estudiante.findById(req.params.id);
  if (!estudiante) throw httpError(404, 'Estudiante no encontrado');

  // Si se va a admitir, validar que el programa tenga cupos disponibles
  if (estadoAdmision === 'Admitido' && estudiante.estadoAdmision !== 'Admitido') {
    const programa = await Programa.findById(estudiante.programa);
    const admitidos = await Estudiante.countDocuments({
      programa: estudiante.programa,
      estadoAdmision: 'Admitido',
    });
    if (programa && admitidos >= programa.cupos) {
      throw httpError(409, `Sin cupos: el programa ya tiene ${admitidos}/${programa.cupos} admitidos`);
    }
  }

  estudiante.estadoAdmision = estadoAdmision;
  await estudiante.save();
  await estudiante.populate(poblarPrograma);
  res.json({ ok: true, mensaje: `Estado cambiado a ${estadoAdmision}`, data: estudiante });
});

// DELETE /api/estudiantes/:id
const eliminar = asyncHandler(async (req, res) => {
  const estudiante = await Estudiante.findByIdAndDelete(req.params.id);
  if (!estudiante) throw httpError(404, 'Estudiante no encontrado');
  res.json({ ok: true, mensaje: 'Estudiante eliminado' });
});

module.exports = { listar, obtener, crear, actualizar, cambiarEstado, eliminar };
