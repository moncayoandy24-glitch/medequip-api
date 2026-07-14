const { authService } = require('../services/authService');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHelper');

const authController = {
  registrar: asyncHandler(async (req, res) => {
    const resultado = await authService.registrar(req.body);
    sendSuccess(res, resultado, 'Usuario registrado exitosamente', 201);
  }),

  login: asyncHandler(async (req, res) => {
    const resultado = await authService.login(req.body);
    sendSuccess(res, resultado, 'Inicio de sesión exitoso');
  }),

  perfil: asyncHandler(async (req, res) => {
    const usuario = await authService.perfil(req.user.id);
    sendSuccess(res, usuario, 'Perfil obtenido');
  }),

  cambiarPassword: asyncHandler(async (req, res) => {
    await authService.cambiarPassword(req.user.id, req.body);
    sendSuccess(res, null, 'Contraseña actualizada exitosamente');
  }),
};

const validaciones = {
  registrar: [
    require('express-validator').body('nombre').notEmpty().withMessage('El nombre es obligatorio').isString().isLength({ max: 100 }),
    require('express-validator').body('email').isEmail().withMessage('Email inválido').isLength({ max: 150 }),
    require('express-validator').body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  ],
  login: [
    require('express-validator').body('email').isEmail().withMessage('Email inválido'),
    require('express-validator').body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  ],
  cambiarPassword: [
    require('express-validator').body('passwordActual').notEmpty().withMessage('La contraseña actual es obligatoria'),
    require('express-validator').body('nuevaPassword').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
  ],
};

module.exports = { authController, validaciones };
