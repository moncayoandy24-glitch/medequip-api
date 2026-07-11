const { rolRepository } = require('../repositories/rolRepository');

const rolService = {
  async obtenerTodos() {
    return await rolRepository.findAll();
  },

  async obtenerPorId(id) {
    const rol = await rolRepository.findById(id);
    if (!rol) {
      throw new Error('Rol no encontrado');
    }
    return rol;
  },

  async crear(data) {
    const existente = await rolRepository.findByName(data.nombre);
    if (existente) {
      throw new Error('El rol ya existe');
    }
    return await rolRepository.create(data);
  },

  async actualizar(id, data) {
    const existente = await rolRepository.findById(id);
    if (!existente) {
      throw new Error('Rol no encontrado');
    }
    if (data.nombre && data.nombre !== existente.nombre) {
      const nombreRepetido = await rolRepository.findByName(data.nombre);
      if (nombreRepetido) {
        throw new Error('El nombre del rol ya está en uso');
      }
    }
    return await rolRepository.update(id, data);
  },

  async eliminar(id) {
    const rol = await rolRepository.findById(id);
    if (!rol) {
      throw new Error('Rol no encontrado');
    }
    return await rolRepository.delete(id);
  },
};

module.exports = { rolService };
