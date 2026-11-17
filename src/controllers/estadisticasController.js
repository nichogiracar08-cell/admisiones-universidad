const Estudiante = require('../models/Estudiante');
const Programa = require('../models/Programa');
const Facultad = require('../models/Facultad');
const { asyncHandler } = require('../middlewares/errores');

// GET /api/estadisticas
const resumen = asyncHandler(async (req, res) => {
  const [facultades, programas, estudiantes, porEstado, porPrograma] = await Promise.all([
    Facultad.countDocuments(),
    Programa.countDocuments(),
    Estudiante.countDocuments(),
    Estudiante.aggregate([{ $group: { _id: '$estadoAdmision', total: { $sum: 1 } } }]),
    Estudiante.aggregate([
      { $group: { _id: '$programa', inscritos: { $sum: 1 } } },
      { $lookup: { from: 'programas', localField: '_id', foreignField: '_id', as: 'programa' } },
      { $unwind: '$programa' },
      { $project: { _id: 0, programa: '$programa.nombre', inscritos: 1 } },
      { $sort: { inscritos: -1 } },
    ]),
  ]);

  res.json({
    ok: true,
    data: {
      facultades,
      programas,
      estudiantes,
      porEstado: Object.fromEntries(porEstado.map((e) => [e._id, e.total])),
      porPrograma,
    },
  });
});

module.exports = { resumen };
