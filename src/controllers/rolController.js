const { rolService } = require('../services/rolService');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHelper');

const rolController = {
  listar: asyncHandler(async (req, res) => {
    const roles = await rolService.obtenerTodos();
    sendSuccess(res, roles, 'Roles obtenidos');
  }),

  obtener: asyncHandler(async (req, res) => {
    const rol = await rolService.obtenerPorId(req.params.id);
    sendSuccess(res, rol, 'Rol obtenido');
  }),

  crear: asyncHandler(async (req, res) => {
    const rol = await rolService.crear(req.body);
    sendSuccess(res, rol, 'Rol creado', 201);
  }),

  actualizar: asyncHandler(async (req, res) => {
    const rol = await rolService.actualizar(req.params.id, req.body);
    sendSuccess(res, rol, 'Rol actualizado');
  }),
};

const validaciones = {
  listar: [],
  obtener: [require('express-validator').param('id').isUUID(4).withMessage('ID inválido')],
  crear: [
    require('express-validator').body('nombre').notEmpty().withMessage('El nombre es obligatorio').isString().isLength({ max: 50 }),
    require('express-validator').body('descripcion').optional().isString().isLength({ max: 255 }),
  ],
  actualizar: [
    require('express-validator').param('id').isUUID(4).withMessage('ID inválido'),
    require('express-validator').body('nombre').optional().isString().isLength({ max: 50 }),
    require('express-validator').body('descripcion').optional().isString().isLength({ max: 255 }),
  ],
};

module.exports = { rolController, validaciones };
