const { rolRepository } = require('../repositories/rolRepository');
const { AppError } = require('../utils/appError');

const rolService = {
  async obtenerTodos() {
    return await rolRepository.findAll();
  },

  async obtenerPorId(id) {
    const rol = await rolRepository.findById(id);
    if (!rol) {
      throw new AppError('Rol no encontrado', 404);
    }
    return rol;
  },

  async crear(data) {
    const existente = await rolRepository.findByName(data.nombre);
    if (existente) {
      throw new AppError('El rol ya existe', 409);
    }
    return await rolRepository.create(data);
  },

  async actualizar(id, data) {
    const existente = await rolRepository.findById(id);
    if (!existente) {
      throw new AppError('Rol no encontrado', 404);
    }
    if (data.nombre && data.nombre !== existente.nombre) {
      const nombreRepetido = await rolRepository.findByName(data.nombre);
      if (nombreRepetido) {
        throw new AppError('El nombre del rol ya está en uso', 409);
      }
    }

    const updateData = {};
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;

    return await rolRepository.update(id, updateData);
  },
};

module.exports = { rolService };
