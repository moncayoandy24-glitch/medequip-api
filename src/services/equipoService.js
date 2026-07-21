const { equipoRepository } = require('../repositories/equipoRepository');
const { categoriaRepository } = require('../repositories/categoriaRepository');
const { ubicacionRepository } = require('../repositories/ubicacionRepository');
const { proveedorRepository } = require('../repositories/proveedorRepository');
const { AppError } = require('../utils/appError');

const equipoService = {
  obtenerTodos: (filters) => equipoRepository.findAll(filters),
  async obtenerPorId(id) {
    const equipo = await equipoRepository.findById(id);
    if (!equipo) throw new AppError('Equipo no encontrado', 404);
    return equipo;
  },
  async validarRelaciones(data) {
    const checks = [
      ['categoria_id', categoriaRepository, 'Categoría'],
      ['ubicacion_id', ubicacionRepository, 'Ubicación'],
      ['proveedor_id', proveedorRepository, 'Proveedor'],
    ];
    for (const [field, repository, label] of checks) {
      if (data[field]) {
        const row = await repository.findById(data[field]);
        if (!row || !row.activo) throw new AppError(`${label} no válido`, 400);
      }
    }
  },
  async validarUnicos(data, actual) {
    for (const field of ['codigo_interno', 'numero_serie']) {
      if (data[field] && (!actual || data[field].toLowerCase() !== actual[field].toLowerCase())) {
        if (await equipoRepository.findByUnique(field, data[field])) {
          throw new AppError(`El ${field} ya está registrado`, 409);
        }
      }
    }
  },
  async crear(data) {
    await this.validarUnicos(data);
    await this.validarRelaciones(data);
    return equipoRepository.create(data);
  },
  async actualizar(id, data) {
    const actual = await this.obtenerPorId(id);
    await this.validarUnicos(data, actual);
    await this.validarRelaciones(data);
    return equipoRepository.update(id, data);
  },
  async cambiarEstado(id, estado) {
    const actual = await this.obtenerPorId(id);
    if (estado === 'dado_de_baja') return equipoRepository.softDelete(id);
    if (!actual.activo) throw new AppError('No se puede cambiar el estado de un equipo dado de baja', 409);
    return equipoRepository.setEstado(id, estado);
  },
  async eliminar(id) {
    await this.obtenerPorId(id);
    return equipoRepository.softDelete(id);
  },
};

module.exports = { equipoService };
