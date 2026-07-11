const express = require('express');
const { authController, validaciones } = require('../controllers/authController');
const { validate } = require('../middlewares/validate');

const router = express.Router();

router.post('/registro', validate(validaciones.registrar), authController.registrar);
router.post('/login', validate(validaciones.login), authController.login);

module.exports = router;
