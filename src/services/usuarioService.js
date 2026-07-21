const bcrypt = require('bcrypt');
const { usuarioRepository } = require('../repositories/usuarioRepository');
const { rolRepository } = require('../repositories/rolRepository');
const { AppError } = require('../utils/appError');

const usuarioService = {
  async obtenerTodos(filtros) {
    return usuarioRepository.findAll(filtros);
  },
  async obtenerPorId(id) {
    const usuario = await usuarioRepository.findById(id);
    if (!usuario) throw new AppError('Usuario no encontrado', 404);
    return usuario;
  },
  async crear(data) {
    if (await usuarioRepository.findByEmail(data.email)) throw new AppError('El correo ya está registrado', 409);
    let rol;
    if (data.rol_id) {
      rol = await rolRepository.findById(data.rol_id);
      if (!rol || !rol.activo) throw new AppError('Rol no válido', 400);
    }
    const password_hash = await bcrypt.hash(data.password, 10);
    const creado = await usuarioRepository.createWithRole({ ...data, password_hash }, rol?.id);
    return usuarioRepository.findById(creado.id);
  },
  async actualizar(id, data) {
    const usuario = await this.obtenerPorId(id);
    if (data.email && data.email.toLowerCase() !== usuario.email.toLowerCase()) {
      if (await usuarioRepository.findByEmail(data.email)) throw new AppError('El correo ya está en uso', 409);
    }
    if (data.rol_id) {
      const rol = await rolRepository.findById(data.rol_id);
      if (!rol || !rol.activo) throw new AppError('Rol no válido', 400);
      await usuarioRepository.asignarRol(id, data.rol_id);
    }
    const updateData = {
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      telefono: data.telefono,
      cargo: data.cargo,
      ...(data.password && { password_hash: await bcrypt.hash(data.password, 10) }),
    };
    return usuarioRepository.update(id, updateData);
  },
  async cambiarEstado(id, activo) {
    await this.obtenerPorId(id);
    await usuarioRepository.setActive(id, activo);
    return usuarioRepository.findById(id);
  },
  async eliminar(id) {
    return this.cambiarEstado(id, false);
  },
};

module.exports = { usuarioService };
