const { usuarioService } = require('../services/usuarioService');
const { asyncHandler } = require('../utils/asyncHandler');

const usuarioController = {
  listar: asyncHandler(async (req, res) => {
    const usuarios = await usuarioService.obtenerTodos();
    res.json({ data: usuarios });
  }),

  obtener: asyncHandler(async (req, res) => {
    const usuario = await usuarioService.obtenerPorId(req.params.id);
    res.json({ data: usuario });
  }),

  crear: asyncHandler(async (req, res) => {
    const usuario = await usuarioService.crear(req.body);
    res.status(201).json({ data: usuario });
  }),

  actualizar: asyncHandler(async (req, res) => {
    const usuario = await usuarioService.actualizar(req.params.id, req.body);
    res.json({ data: usuario });
  }),

  eliminar: asyncHandler(async (req, res) => {
    await usuarioService.eliminar(req.params.id);
    res.status(204).send();
  }),
};

const validaciones = {
  listar: [],
  obtener: [require('express-validator').param('id').isUUID(4).withMessage('ID inválido')],
  crear: [
    require('express-validator').body('nombre').notEmpty().withMessage('El nombre es obligatorio').isString().isLength({ max: 100 }),
    require('express-validator').body('email').isEmail().withMessage('Email inválido').isLength({ max: 150 }),
    require('express-validator').body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    require('express-validator').body('rol_id').optional().isUUID(4).withMessage('Rol inválido'),
  ],
  actualizar: [
    require('express-validator').param('id').isUUID(4).withMessage('ID inválido'),
    require('express-validator').body('nombre').optional().isString().isLength({ max: 100 }),
    require('express-validator').body('email').optional().isEmail().withMessage('Email inválido').isLength({ max: 150 }),
    require('express-validator').body('password').optional().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    require('express-validator').body('rol_id').optional().isUUID(4).withMessage('Rol inválido'),
  ],
  eliminar: [require('express-validator').param('id').isUUID(4).withMessage('ID inválido')],
};

module.exports = { usuarioController, validaciones };
