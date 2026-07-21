const { AppError } = require('../utils/appError');

const createCatalogService = ({ repository, nombreRecurso, uniqueFields = ['nombre'] }) => ({
  obtenerTodos: (filters) => repository.findAll(filters),
  async obtenerPorId(id) {
    const row = await repository.findById(id);
    if (!row) throw new AppError(`${nombreRecurso} no encontrado`, 404);
    return row;
  },
  async crear(data) {
    for (const field of uniqueFields) {
      if (data[field] && await repository.findBy(field, data[field])) {
        throw new AppError(`Ya existe un registro con el mismo ${field}`, 409);
      }
    }
    return repository.create(data);
  },
  async actualizar(id, data) {
    const actual = await this.obtenerPorId(id);
    for (const field of uniqueFields) {
      if (data[field] && String(data[field]).toLowerCase() !== String(actual[field] || '').toLowerCase()) {
        if (await repository.findBy(field, data[field])) throw new AppError(`El ${field} ya está en uso`, 409);
      }
    }
    return repository.update(id, data);
  },
  async cambiarEstado(id, activo) {
    await this.obtenerPorId(id);
    return repository.setActive(id, activo);
  },
});

module.exports = { createCatalogService };
