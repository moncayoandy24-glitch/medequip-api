const { body, param, query } = require('express-validator');
const { equipoService } = require('../services/equipoService');
const { asyncHandler } = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const { Equipo } = require('../entities/Equipo');

const estados = Equipo.ESTADOS;
const riesgos = Equipo.RIESGOS;
const equipoController = {
  listar: asyncHandler(async (req, res) => {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const result = await equipoService.obtenerTodos({ ...req.query, page, limit, activo: req.query.activo === undefined ? undefined : req.query.activo === 'true' });
    return success(res, {
      message: 'Equipos obtenidos correctamente', data: result.rows,
      pagination: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) },
    });
  }),
  obtener: asyncHandler(async (req, res) => success(res, { message: 'Equipo obtenido correctamente', data: await equipoService.obtenerPorId(req.params.id) })),
  crear: asyncHandler(async (req, res) => success(res, { status: 201, message: 'Equipo registrado correctamente', data: await equipoService.crear(req.body) })),
  actualizar: asyncHandler(async (req, res) => success(res, { message: 'Equipo actualizado correctamente', data: await equipoService.actualizar(req.params.id, req.body) })),
  cambiarEstado: asyncHandler(async (req, res) => success(res, { message: 'Estado del equipo actualizado correctamente', data: await equipoService.cambiarEstado(req.params.id, req.body.estado) })),
  eliminar: asyncHandler(async (req, res) => success(res, { message: 'Equipo dado de baja correctamente', data: await equipoService.eliminar(req.params.id) })),
};

const optionalText = (field, max) => body(field).optional({ nullable: true }).trim().isLength({ max });
const opcionales = [
  optionalText('tipo_equipo', 100), optionalText('marca', 100), optionalText('modelo', 100), optionalText('fabricante', 150),
  body('fecha_adquisicion').optional({ nullable: true }).isISO8601(), body('precio_adquisicion').optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body('vida_util_estimada').optional({ nullable: true }).isInt({ min: 0 }).toInt(), body('estado').optional().isIn(estados),
  body('categoria_id').optional({ nullable: true }).isUUID(), body('ubicacion_id').optional({ nullable: true }).isUUID(), body('proveedor_id').optional({ nullable: true }).isUUID(),
  optionalText('servicio_hospitalario', 120), body('nivel_riesgo').optional().isIn(riesgos),
  body('fecha_ultimo_mantenimiento').optional({ nullable: true }).isISO8601(), body('fecha_proximo_mantenimiento').optional({ nullable: true }).isISO8601(),
  body('observaciones').optional({ nullable: true }).isString(), body('imagen_url').optional({ nullable: true }).isURL(),
];
const validaciones = {
  listar: [
    query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 }), query('estado').optional().isIn(estados),
    query('riesgo').optional().isIn(riesgos), query('activo').optional().isBoolean(), query('sort').optional().isIn(['nombre', 'codigo', 'estado', 'riesgo', 'created_at']),
    query('order').optional().isIn(['asc', 'desc']), query('search').optional().isLength({ max: 150 }), query('categoria').optional().isLength({ max: 120 }),
    query('ubicacion').optional().isLength({ max: 120 }), query('tipo').optional().isLength({ max: 100 }), query('codigo').optional().isLength({ max: 50 }),
    query('numero_serie').optional().isLength({ max: 120 }),
  ],
  obtener: [param('id').isUUID()],
  crear: [body('codigo_interno').trim().notEmpty().isLength({ max: 50 }), body('nombre').trim().notEmpty().isLength({ max: 150 }), body('numero_serie').trim().notEmpty().isLength({ max: 120 }), ...opcionales],
  actualizar: [param('id').isUUID(), body('codigo_interno').optional().trim().notEmpty().isLength({ max: 50 }), body('nombre').optional().trim().notEmpty().isLength({ max: 150 }), body('numero_serie').optional().trim().notEmpty().isLength({ max: 120 }), ...opcionales],
  cambiarEstado: [param('id').isUUID(), body('estado').isIn(estados)],
  eliminar: [param('id').isUUID()],
};

module.exports = { equipoController, validaciones };
