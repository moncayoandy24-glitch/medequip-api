const { BaseEntity } = require('./BaseEntity');
class Ubicacion extends BaseEntity {
  constructor(data = {}) { super(data, ['id', 'nombre', 'piso', 'numero_habitacion', 'responsable', 'descripcion', 'activo', 'created_at', 'updated_at']); }
  estaActiva() { return this.activo === true; }
}
module.exports = { Ubicacion };
