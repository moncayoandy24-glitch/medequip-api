const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { pool } = require('../config/database');
const { usuarioRepository } = require('../repositories/usuarioRepository');
const { rolRepository } = require('../repositories/rolRepository');
const { AppError } = require('../utils/appError');

const authService = {
  async registrar(data) {
    const existente = await usuarioRepository.findByEmail(data.email);
    if (existente) {
      throw new AppError('El email ya está registrado', 409);
    }

    const rolNombre = 'usuario';
    const rol = await rolRepository.findByName(rolNombre);
    if (!rol) {
      throw new AppError('Rol por defecto no configurado', 500);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const saltRounds = 10;
      const password_hash = await bcrypt.hash(data.password, saltRounds);

      const usuario = await usuarioRepository.create({
        nombre: data.nombre,
        email: data.email,
        password_hash,
      }, client);

      await usuarioRepository.asignarRol(usuario.id, rol.id, client);

      await client.query('COMMIT');

      const usuarioConRoles = await usuarioRepository.findById(usuario.id);
      const token = this.generarToken(usuarioConRoles);

      const { password_hash: _, ...usuarioSinPassword } = usuarioConRoles;

      return { usuario: usuarioSinPassword, token };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async login(data) {
    const usuario = await usuarioRepository.findByEmail(data.email);
    if (!usuario) {
      throw new AppError('Credenciales incorrectas', 401);
    }

    const esValido = await bcrypt.compare(data.password, usuario.password_hash);
    if (!esValido) {
      throw new AppError('Credenciales incorrectas', 401);
    }

    if (!usuario.activo) {
      throw new AppError('Usuario desactivado', 403);
    }

    const usuarioConRoles = await usuarioRepository.findById(usuario.id);
    const token = this.generarToken(usuarioConRoles);

    const { password_hash: _, ...usuarioSinPassword } = usuarioConRoles;

    return { usuario: usuarioSinPassword, token };
  },

  generarToken(usuario) {
    const roles = (usuario.roles || []).filter(Boolean);
    return jwt.sign(
      { id: usuario.id, email: usuario.email, roles },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  },

  async perfil(usuarioId) {
    const usuario = await usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }
    const { password_hash: _, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
  },

  async cambiarPassword(usuarioId, data) {
    const usuario = await usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const esValido = await bcrypt.compare(data.passwordActual, usuario.password_hash);
    if (!esValido) {
      throw new AppError('Contraseña actual incorrecta', 401);
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(data.nuevaPassword, saltRounds);

    await usuarioRepository.updatePassword(usuarioId, password_hash);
  },
};

module.exports = { authService };
