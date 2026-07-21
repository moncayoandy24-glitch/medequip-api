const { BaseEntity } = require('./BaseEntity');
class Rol extends BaseEntity {
  static NOMBRES = ['admin', 'ingeniero_biomedico', 'tecnico', 'usuario_clinico'];
  constructor(data = {}) { super(data, ['id', 'nombre', 'descripcion', 'activo', 'created_at', 'updated_at']); }
  estaActivo() { return this.activo === true; }
}
module.exports = { Rol };
