const { body, param } = require('express-validator');
const { rolService } = require('../services/rolService');
const { asyncHandler } = require('../utils/asyncHandler');
const { success } = require('../utils/response');

const rolController = {
  listar: asyncHandler(async (req, res) => success(res, { message: 'Roles obtenidos correctamente', data: await rolService.obtenerTodos() })),
  obtener: asyncHandler(async (req, res) => success(res, { message: 'Rol obtenido correctamente', data: await rolService.obtenerPorId(req.params.id) })),
  crear: asyncHandler(async (req, res) => success(res, { status: 201, message: 'Rol creado correctamente', data: await rolService.crear(req.body) })),
  actualizar: asyncHandler(async (req, res) => success(res, { message: 'Rol actualizado correctamente', data: await rolService.actualizar(req.params.id, req.body) })),
  cambiarEstado: asyncHandler(async (req, res) => success(res, { message: 'Estado del rol actualizado correctamente', data: await rolService.cambiarEstado(req.params.id, req.body.activo) })),
  eliminar: asyncHandler(async (req, res) => success(res, { message: 'Rol desactivado correctamente', data: await rolService.eliminar(req.params.id) })),
};

const id = param('id').isUUID().withMessage('ID inválido');
const validaciones = {
  listar: [], obtener: [id], eliminar: [id],
  crear: [body('nombre').trim().notEmpty().isLength({ max: 50 }), body('descripcion').optional({ nullable: true }).isString().isLength({ max: 255 })],
  actualizar: [id, body('nombre').optional().trim().notEmpty().isLength({ max: 50 }), body('descripcion').optional({ nullable: true }).isString().isLength({ max: 255 })],
  cambiarEstado: [id, body('activo').isBoolean().toBoolean()],
};

module.exports = { rolController, validaciones };
