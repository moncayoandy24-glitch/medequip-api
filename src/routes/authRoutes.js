const express = require('express');
const { authController, validaciones } = require('../controllers/authController');
const { validate } = require('../middlewares/validate');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.post('/registro', validate(validaciones.registrar), authController.registrar);
router.post('/login', validate(validaciones.login), authController.login);
router.get('/profile', auth, validate([]), authController.perfil);
router.post('/change-password', auth, validate(validaciones.cambiarPassword), authController.cambiarPassword);

module.exports = router;
