const { body, param, query } = require('express-validator');
const { proveedorService } = require('../services/proveedorService');
const { createCatalogController } = require('./catalogController');
const { asyncHandler } = require('../utils/asyncHandler');
const { success } = require('../utils/response');

const proveedorController = {
  ...createCatalogController(proveedorService, { singular: 'Proveedor', plural: 'Proveedores' }),
  equipos: asyncHandler(async (req, res) => success(res, {
    message: 'Equipos suministrados obtenidos correctamente', data: await proveedorService.obtenerEquipos(req.params.id),
  })),
};
const optional = (field, max) => body(field).optional({ nullable: true }).trim().isLength({ max });
const campos = [optional('ruc', 30), body('email').optional({ nullable: true }).isEmail().normalizeEmail().isLength({ max: 150 }), optional('telefono', 30), body('direccion').optional({ nullable: true }).isString(), optional('persona_contacto', 150)];
const validaciones = {
  listar: [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 }), query('activo').optional().isBoolean(), query('search').optional().isLength({ max: 100 })],
  obtener: [param('id').isUUID()],
  crear: [body('nombre').trim().notEmpty().isLength({ max: 150 }), ...campos],
  actualizar: [param('id').isUUID(), body('nombre').optional().trim().notEmpty().isLength({ max: 150 }), ...campos],
  cambiarEstado: [param('id').isUUID(), body('activo').isBoolean().toBoolean()],
};
module.exports = { proveedorController, validaciones };
