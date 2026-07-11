const { rolService } = require('../services/rolService');
const { asyncHandler } = require('../utils/asyncHandler');

const rolController = {
  listar: asyncHandler(async (req, res) => {
    const roles = await rolService.obtenerTodos();
    res.json({ data: roles });
  }),

  obtener: asyncHandler(async (req, res) => {
    const rol = await rolService.obtenerPorId(req.params.id);
    res.json({ data: rol });
  }),

  crear: asyncHandler(async (req, res) => {
    const rol = await rolService.crear(req.body);
    res.status(201).json({ data: rol });
  }),

  actualizar: asyncHandler(async (req, res) => {
    const rol = await rolService.actualizar(req.params.id, req.body);
    res.json({ data: rol });
  }),

  eliminar: asyncHandler(async (req, res) => {
    await rolService.eliminar(req.params.id);
    res.status(204).send();
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
  eliminar: [require('express-validator').param('id').isUUID(4).withMessage('ID inválido')],
};

module.exports = { rolController, validaciones };
