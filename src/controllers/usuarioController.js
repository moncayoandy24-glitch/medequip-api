const { usuarioService } = require('../services/usuarioService');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHelper');

const usuarioController = {
  listar: asyncHandler(async (req, res) => {
    const usuarios = await usuarioService.obtenerTodos();
    sendSuccess(res, usuarios, 'Usuarios obtenidos');
  }),

  obtener: asyncHandler(async (req, res) => {
    const usuario = await usuarioService.obtenerPorId(req.params.id);
    sendSuccess(res, usuario, 'Usuario obtenido');
  }),

  crear: asyncHandler(async (req, res) => {
    const usuario = await usuarioService.crear(req.body);
    sendSuccess(res, usuario, 'Usuario creado', 201);
  }),

  actualizar: asyncHandler(async (req, res) => {
    const usuario = await usuarioService.actualizar(req.params.id, req.body);
    sendSuccess(res, usuario, 'Usuario actualizado');
  }),

  cambiarEstado: asyncHandler(async (req, res) => {
    const usuario = await usuarioService.cambiarEstado(req.params.id, req.body.activo);
    sendSuccess(res, usuario, 'Estado actualizado');
  }),
};

const validaciones = {
  listar: [],
  obtener: [require('express-validator').param('id').isUUID(4).withMessage('ID inválido')],
  crear: [
    require('express-validator').body('nombre').notEmpty().withMessage('El nombre es obligatorio').isString().isLength({ max: 100 }),
    require('express-validator').body('email').isEmail().withMessage('Email inválido').isLength({ max: 150 }),
    require('express-validator').body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  ],
  actualizar: [
    require('express-validator').param('id').isUUID(4).withMessage('ID inválido'),
    require('express-validator').body('nombre').optional().isString().isLength({ max: 100 }),
    require('express-validator').body('email').optional().isEmail().withMessage('Email inválido').isLength({ max: 150 }),
    require('express-validator').body('password').optional().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  ],
  cambiarEstado: [
    require('express-validator').param('id').isUUID(4).withMessage('ID inválido'),
    require('express-validator').body('activo').isBoolean().withMessage('activo debe ser booleano'),
  ],
};

module.exports = { usuarioController, validaciones };
