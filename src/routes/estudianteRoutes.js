const { Router } = require('express');
const c = require('../controllers/estudianteController');
const { soloRol } = require('../middlewares/auth');

const router = Router();

// Asesores y admin inscriben y gestionan estudiantes; solo admin elimina
router.route('/').get(c.listar).post(c.crear);
router.route('/:id').get(c.obtener).put(c.actualizar).delete(soloRol('admin'), c.eliminar);
router.patch('/:id/estado', c.cambiarEstado);

module.exports = router;
