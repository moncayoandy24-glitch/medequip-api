const { rolRepository } = require('../repositories/rolRepository');
const { AppError } = require('../utils/appError');

const rolService = {
  obtenerTodos: () => rolRepository.findAll(),
  async obtenerPorId(id) {
    const rol = await rolRepository.findById(id);
    if (!rol) throw new AppError('Rol no encontrado', 404);
    return rol;
  },
  async crear(data) {
    if (await rolRepository.findByName(data.nombre)) throw new AppError('El rol ya existe', 409);
    return rolRepository.create(data);
  },
  async actualizar(id, data) {
    const actual = await this.obtenerPorId(id);
    if (data.nombre && data.nombre.toLowerCase() !== actual.nombre.toLowerCase()) {
      if (await rolRepository.findByName(data.nombre)) throw new AppError('El nombre del rol ya está en uso', 409);
    }
    return rolRepository.update(id, data);
  },
  async cambiarEstado(id, activo) {
    await this.obtenerPorId(id);
    return rolRepository.setActive(id, activo);
  },
  async eliminar(id) {
    return this.cambiarEstado(id, false);
  },
};

module.exports = { rolService };
