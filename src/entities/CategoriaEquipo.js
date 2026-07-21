const { BaseEntity } = require('./BaseEntity');
class CategoriaEquipo extends BaseEntity {
  constructor(data = {}) { super(data, ['id', 'nombre', 'descripcion', 'activo', 'created_at', 'updated_at']); }
  estaActiva() { return this.activo === true; }
}
module.exports = { CategoriaEquipo };
