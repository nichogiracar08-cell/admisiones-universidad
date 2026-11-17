const { Router } = require('express');
const c = require('../controllers/programaController');
const { soloRol } = require('../middlewares/auth');

const router = Router();

// Ver: cualquier usuario logueado. Crear/editar/eliminar: solo admin
router.route('/').get(c.listar).post(soloRol('admin'), c.crear);
router
  .route('/:id')
  .get(c.obtener)
  .put(soloRol('admin'), c.actualizar)
  .delete(soloRol('admin'), c.eliminar);

module.exports = router;
