const { body, param, query } = require('express-validator');
const { ubicacionService } = require('../services/ubicacionService');
const { createCatalogController } = require('./catalogController');

const ubicacionController = createCatalogController(ubicacionService, { singular: 'Ubicación', plural: 'Ubicaciones' });
const text = (field, max) => body(field).optional({ nullable: true }).trim().isLength({ max });
const validaciones = {
  listar: [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 }), query('activo').optional().isBoolean(), query('search').optional().isLength({ max: 100 })],
  obtener: [param('id').isUUID()],
  crear: [body('nombre').trim().notEmpty().isLength({ max: 120 }), text('piso', 30), text('numero_habitacion', 30), text('responsable', 150), body('descripcion').optional({ nullable: true }).isString()],
  actualizar: [param('id').isUUID(), body('nombre').optional().trim().notEmpty().isLength({ max: 120 }), text('piso', 30), text('numero_habitacion', 30), text('responsable', 150), body('descripcion').optional({ nullable: true }).isString()],
  cambiarEstado: [param('id').isUUID(), body('activo').isBoolean().toBoolean()],
};
module.exports = { ubicacionController, validaciones };
