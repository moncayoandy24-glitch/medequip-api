const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { usuarioRepository } = require('../repositories/usuarioRepository');
const { rolRepository } = require('../repositories/rolRepository');
const { AppError } = require('../utils/appError');

const authService = {
  async registrar(data) {
    if (await usuarioRepository.findByEmail(data.email)) {
      throw new AppError('El correo ya está registrado', 409);
    }
    const password_hash = await bcrypt.hash(data.password, 10);
    const rolPredeterminado = await rolRepository.findByName('usuario_clinico');
    const creado = await usuarioRepository.createWithRole({ ...data, password_hash }, rolPredeterminado?.id);
    const usuario = await usuarioRepository.findById(creado.id);
    return { usuario, token: this.generarToken(usuario) };
  },

  async login({ email, password }) {
    const registro = await usuarioRepository.findByEmail(email);
    if (!registro || !(await bcrypt.compare(password, registro.password_hash))) {
      throw new AppError('Credenciales inválidas', 401);
    }
    if (!registro.activo) throw new AppError('El usuario está desactivado', 403);
    const usuario = await usuarioRepository.findById(registro.id);
    return { usuario, token: this.generarToken(usuario) };
  },

  async perfil(id) {
    const usuario = await usuarioRepository.findById(id);
    if (!usuario || !usuario.activo) throw new AppError('Usuario no encontrado', 404);
    return usuario;
  },

  async cambiarPassword(id, { passwordActual, passwordNueva }) {
    const registro = await usuarioRepository.findById(id);
    const credenciales = await usuarioRepository.findByEmail(registro?.email || '');
    if (!credenciales || !(await bcrypt.compare(passwordActual, credenciales.password_hash))) {
      throw new AppError('La contraseña actual es incorrecta', 401);
    }
    await usuarioRepository.updatePassword(id, await bcrypt.hash(passwordNueva, 10));
  },

  generarToken(usuario) {
    if (!process.env.JWT_SECRET) throw new AppError('JWT_SECRET no está configurado', 500);
    return jwt.sign(
      { id: usuario.id, email: usuario.email, roles: usuario.roles || [] },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
  },
};

module.exports = { authService };
