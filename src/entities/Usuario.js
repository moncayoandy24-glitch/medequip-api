const { BaseEntity } = require('./BaseEntity');
class Usuario extends BaseEntity {
  constructor(data = {}) { super(data, ['id', 'nombre', 'apellido', 'email', 'password_hash', 'telefono', 'cargo', 'activo', 'roles', 'created_at', 'updated_at']); }
  estaActivo() { return this.activo === true; }
  tieneRol(rol) { return Array.isArray(this.roles) && this.roles.includes(rol); }
  toJSON() { const data = super.toJSON(); delete data.password_hash; return data; }
}
module.exports = { Usuario };
