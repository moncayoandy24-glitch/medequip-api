const { BaseEntity } = require('./BaseEntity');
class Proveedor extends BaseEntity {
  constructor(data = {}) { super(data, ['id', 'nombre', 'ruc', 'email', 'telefono', 'direccion', 'persona_contacto', 'activo', 'created_at', 'updated_at']); }
  estaActivo() { return this.activo === true; }
}
module.exports = { Proveedor };
