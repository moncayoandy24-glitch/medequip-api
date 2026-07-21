const { BaseEntity } = require('./BaseEntity');
class Repuesto extends BaseEntity {
  constructor(data = {}) { super(data, ['id', 'nombre', 'codigo', 'descripcion', 'cantidad_disponible', 'stock_minimo', 'precio', 'proveedor_id', 'activo', 'created_at', 'updated_at', 'proveedor_nombre']); }
  tieneStock(cantidad = 1) { return this.activo === true && Number(this.cantidad_disponible) >= cantidad; }
  estaBajoStock() { return Number(this.cantidad_disponible) <= Number(this.stock_minimo); }
}
module.exports = { Repuesto };
