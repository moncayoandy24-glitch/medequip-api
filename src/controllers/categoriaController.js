const { body, param, query } = require('express-validator');
const { categoriaService } = require('../services/categoriaService');
const { createCatalogController } = require('./catalogController');

const categoriaController = createCatalogController(categoriaService, { singular: 'Categoría', plural: 'Categorías' });
const validaciones = {
  listar: [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 }), query('activo').optional().isBoolean(), query('search').optional().isLength({ max: 100 })],
  obtener: [param('id').isUUID()],
  crear: [body('nombre').trim().notEmpty().isLength({ max: 100 }), body('descripcion').optional({ nullable: true }).isString()],
  actualizar: [param('id').isUUID(), body('nombre').optional().trim().notEmpty().isLength({ max: 100 }), body('descripcion').optional({ nullable: true }).isString()],
  cambiarEstado: [param('id').isUUID(), body('activo').isBoolean().toBoolean()],
};
module.exports = { categoriaController, validaciones };
