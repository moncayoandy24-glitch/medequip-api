const { body, param, query } = require('express-validator');
const { usuarioService } = require('../services/usuarioService');
const { asyncHandler } = require('../utils/asyncHandler');
const { success } = require('../utils/response');

const usuarioController = {
  listar: asyncHandler(async (req, res) => {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const resultado = await usuarioService.obtenerTodos({
      page, limit, search: req.query.search || '',
      activo: req.query.activo === undefined ? undefined : req.query.activo === 'true',
    });
    return success(res, {
      message: 'Usuarios obtenidos correctamente', data: resultado.rows,
      pagination: { page, limit, total: resultado.total, totalPages: Math.ceil(resultado.total / limit) },
    });
  }),
  obtener: asyncHandler(async (req, res) => success(res, {
    message: 'Usuario obtenido correctamente', data: await usuarioService.obtenerPorId(req.params.id),
  })),
  crear: asyncHandler(async (req, res) => success(res, {
    status: 201, message: 'Usuario creado correctamente', data: await usuarioService.crear(req.body),
  })),
  actualizar: asyncHandler(async (req, res) => success(res, {
    message: 'Usuario actualizado correctamente', data: await usuarioService.actualizar(req.params.id, req.body),
  })),
  cambiarEstado: asyncHandler(async (req, res) => success(res, {
    message: 'Estado del usuario actualizado correctamente',
    data: await usuarioService.cambiarEstado(req.params.id, req.body.activo),
  })),
  eliminar: asyncHandler(async (req, res) => success(res, {
    message: 'Usuario desactivado correctamente', data: await usuarioService.eliminar(req.params.id),
  })),
};

const id = param('id').isUUID().withMessage('ID inválido');
const camposOpcionales = [
  body('nombre').optional().trim().notEmpty().isLength({ max: 100 }),
  body('apellido').optional({ nullable: true }).trim().isLength({ max: 100 }),
  body('email').optional().isEmail().withMessage('Correo inválido').normalizeEmail().isLength({ max: 150 }),
  body('password').optional().isLength({ min: 8, max: 72 }),
  body('telefono').optional({ nullable: true }).trim().isLength({ max: 30 }),
  body('cargo').optional({ nullable: true }).trim().isLength({ max: 100 }),
  body('rol_id').optional().isUUID().withMessage('Rol inválido'),
];
const validaciones = {
  listar: [
    query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 }),
    query('activo').optional().isBoolean(), query('search').optional().isString().isLength({ max: 100 }),
  ],
  obtener: [id],
  crear: [
    body('nombre').trim().notEmpty().isLength({ max: 100 }),
    body('email').isEmail().normalizeEmail().isLength({ max: 150 }),
    body('password').isLength({ min: 8, max: 72 }),
    ...camposOpcionales.slice(1),
  ],
  actualizar: [id, ...camposOpcionales],
  cambiarEstado: [id, body('activo').isBoolean().withMessage('activo debe ser booleano').toBoolean()],
  eliminar: [id],
};

module.exports = { usuarioController, validaciones };
