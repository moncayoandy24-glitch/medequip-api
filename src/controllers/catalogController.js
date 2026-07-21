const { asyncHandler } = require('../utils/asyncHandler');
const { success } = require('../utils/response');

const createCatalogController = (service, labels) => ({
  listar: asyncHandler(async (req, res) => {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const result = await service.obtenerTodos({
      page, limit, search: req.query.search || '',
      activo: req.query.activo === undefined ? undefined : req.query.activo === 'true',
    });
    return success(res, {
      message: `${labels.plural} obtenidos correctamente`, data: result.rows,
      pagination: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) },
    });
  }),
  obtener: asyncHandler(async (req, res) => success(res, {
    message: `${labels.singular} obtenido correctamente`, data: await service.obtenerPorId(req.params.id),
  })),
  crear: asyncHandler(async (req, res) => success(res, {
    status: 201, message: `${labels.singular} creado correctamente`, data: await service.crear(req.body),
  })),
  actualizar: asyncHandler(async (req, res) => success(res, {
    message: `${labels.singular} actualizado correctamente`, data: await service.actualizar(req.params.id, req.body),
  })),
  cambiarEstado: asyncHandler(async (req, res) => success(res, {
    message: `Estado de ${labels.singular.toLowerCase()} actualizado correctamente`,
    data: await service.cambiarEstado(req.params.id, req.body.activo),
  })),
});

module.exports = { createCatalogController };
