const bcrypt = require('bcrypt');
const { pool } = require('../config/database');
const { usuarioRepository } = require('../repositories/usuarioRepository');
const { rolRepository } = require('../repositories/rolRepository');
const { AppError } = require('../utils/appError');

const usuarioService = {
  async obtenerTodos() {
    const usuarios = await usuarioRepository.findAll();
    return usuarios.map(({ password_hash, ...u }) => u);
  },

  async obtenerPorId(id) {
    const usuario = await usuarioRepository.findById(id);
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }
    const { password_hash, ...u } = usuario;
    return u;
  },

  async crear(data) {
    const existente = await usuarioRepository.findByEmail(data.email);
    if (existente) {
      throw new AppError('El email ya está registrado', 409);
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(data.password, saltRounds);

    if (data.rol_id) {
      const rol = await rolRepository.findById(data.rol_id);
      if (!rol) {
        throw new AppError('Rol no válido', 404);
      }
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const usuario = await usuarioRepository.create({
        nombre: data.nombre,
        email: data.email,
        password_hash,
      }, client);

      if (data.rol_id) {
        await usuarioRepository.asignarRol(usuario.id, data.rol_id, client);
      }

      await client.query('COMMIT');

      const usuarioConRoles = await usuarioRepository.findById(usuario.id);
      const { password_hash: _, ...u } = usuarioConRoles;
      return u;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async actualizar(id, data) {
    const usuario = await usuarioRepository.findById(id);
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    if (data.email && data.email !== usuario.email) {
      const existente = await usuarioRepository.findByEmail(data.email);
      if (existente) {
        throw new AppError('El email ya está en uso', 409);
      }
    }

    const updateData = {};
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.email !== undefined) updateData.email = data.email;

    if (data.password) {
      const saltRounds = 10;
      updateData.password_hash = await bcrypt.hash(data.password, saltRounds);
    }

    await usuarioRepository.update(id, updateData);

    return await this.obtenerPorId(id);
  },

  async cambiarEstado(id, activo) {
    const usuario = await usuarioRepository.findById(id);
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    if (usuario.email === process.env.ADMIN_EMAIL && !activo) {
      throw new AppError('No se puede desactivar el administrador principal', 403);
    }

    await usuarioRepository.update(id, { activo });
    return await this.obtenerPorId(id);
  },
};

module.exports = { usuarioService };
