const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { usuarioRepository } = require('../repositories/usuarioRepository');
const { rolRepository } = require('../repositories/rolRepository');

const authService = {
  async registrar(data) {
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
    const token = this.generarToken(usuarioConRoles);

    return { usuario: usuarioConRoles, token };
  },

  async login(data) {
    const usuario = await usuarioRepository.findByEmail(data.email);
    if (!usuario) {
      throw new Error('Credenciales inválidas');
    }

    const esValido = await bcrypt.compare(data.password, usuario.password_hash);
    if (!esValido) {
      throw new Error('Credenciales inválidas');
    }

    if (!usuario.activo) {
      throw new Error('Usuario desactivado');
    }

    const usuarioConRoles = await usuarioRepository.findById(usuario.id);
    const token = this.generarToken(usuarioConRoles);

    return { usuario: usuarioConRoles, token };
  },

  generarToken(usuario) {
    const roles = usuario.roles || [];
    return jwt.sign(
      { id: usuario.id, email: usuario.email, roles },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  },
};

module.exports = { authService };
