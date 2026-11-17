const { Router } = require('express');
const c = require('../controllers/authController');
const { proteger } = require('../middlewares/auth');

const router = Router();

router.post('/registro', c.registro);
router.post('/login', c.login);
router.post('/logout', proteger, c.logout);
router.get('/perfil', proteger, c.perfil);
router.get('/sesiones', proteger, c.misSesiones);

module.exports = router;
