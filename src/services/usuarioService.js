const bcrypt = require('bcrypt');
const { usuarioRepository } = require('../repositories/usuarioRepository');
const { rolRepository } = require('../repositories/rolRepository');

const usuarioService = {
  async obtenerTodos() {
    return await usuarioRepository.findAll();
  },

  async obtenerPorId(id) {
    const usuario = await usuarioRepository.findById(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    return usuario;
  },

  async crear(data) {
    const existente = await usuarioRepository.findByEmail(data.email);
    if (existente) {
      throw new Error('El email ya está registrado');
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(data.password, saltRounds);

    const usuario = await usuarioRepository.create({
      nombre: data.nombre,
      email: data.email,
      password_hash,
    });

    if (data.rol_id) {
      const rol = await rolRepository.findById(data.rol_id);
      if (!rol) {
        throw new Error('Rol no válido');
      }
      await usuarioRepository.asignarRol(usuario.id, data.rol_id);
    }

    const usuarioConRoles = await usuarioRepository.findById(usuario.id);
    return usuarioConRoles;
  },

  async actualizar(id, data) {
    const usuario = await usuarioRepository.findById(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    if (data.email && data.email !== usuario.email) {
      const existente = await usuarioRepository.findByEmail(data.email);
      if (existente) {
        throw new Error('El email ya está en uso');
      }
    }

    const updateData = {};
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.activo !== undefined) updateData.activo = data.activo;

    if (data.password) {
      const saltRounds = 10;
      updateData.password_hash = await bcrypt.hash(data.password, saltRounds);
    }

    await usuarioRepository.update(id, updateData);

    if (data.rol_id) {
      const rol = await rolRepository.findById(data.rol_id);
      if (!rol) {
        throw new Error('Rol no válido');
      }
      await usuarioRepository.asignarRol(id, data.rol_id);
    }

    return await usuarioRepository.findById(id);
  },

  async eliminar(id) {
    const usuario = await usuarioRepository.findById(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    return await usuarioRepository.delete(id);
  },
};

module.exports = { usuarioService };
