const { body } = require('express-validator');
const { authService } = require('../services/authService');
const { asyncHandler } = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const { auditoriaRepository } = require('../repositories/auditoriaRepository');

const authController = {
  registrar: asyncHandler(async (req, res) => {
    const data = await authService.registrar(req.body);
    auditoriaRepository.create({ usuario_id: data.usuario.id, accion: 'creacion', modulo: 'auth', registro_id: data.usuario.id, ip: req.ip }).catch(() => {});
    return success(res, { status: 201, message: 'Usuario registrado correctamente', data });
  }),
  login: asyncHandler(async (req, res) => {
    const data = await authService.login(req.body);
    auditoriaRepository.create({ usuario_id: data.usuario.id, accion: 'inicio_sesion', modulo: 'auth', registro_id: data.usuario.id, ip: req.ip }).catch(() => {});
    return success(res, { message: 'Inicio de sesión correcto', data });
  }),
  perfil: asyncHandler(async (req, res) => {
    const data = await authService.perfil(req.user.id);
    return success(res, { message: 'Perfil obtenido correctamente', data });
  }),
  cambiarPassword: asyncHandler(async (req, res) => {
    await authService.cambiarPassword(req.user.id, req.body);
    return success(res, { message: 'Contraseña actualizada correctamente' });
  }),
};

const datosUsuario = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio').isLength({ max: 100 }),
  body('apellido').optional({ nullable: true }).trim().isLength({ max: 100 }),
  body('email').isEmail().withMessage('Correo inválido').normalizeEmail().isLength({ max: 150 }),
  body('password').isLength({ min: 8, max: 72 }).withMessage('La contraseña debe tener entre 8 y 72 caracteres'),
  body('telefono').optional({ nullable: true }).trim().isLength({ max: 30 }),
  body('cargo').optional({ nullable: true }).trim().isLength({ max: 100 }),
];

const validaciones = {
  registrar: datosUsuario,
  login: [
    body('email').isEmail().withMessage('Correo inválido').normalizeEmail(),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  ],
  cambiarPassword: [
    body('passwordActual').notEmpty().withMessage('La contraseña actual es obligatoria'),
    body('passwordNueva').isLength({ min: 8, max: 72 }).withMessage('La nueva contraseña debe tener entre 8 y 72 caracteres'),
  ],
};

module.exports = { authController, validaciones };
