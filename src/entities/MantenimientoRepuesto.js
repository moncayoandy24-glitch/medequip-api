const { BaseEntity } = require('./BaseEntity');
class MantenimientoRepuesto extends BaseEntity {
  constructor(data = {}) { super(data, ['mantenimiento_id', 'repuesto_id', 'cantidad', 'precio_unitario', 'created_at']); }
  subtotal() { return Number(this.cantidad) * Number(this.precio_unitario); }
}
module.exports = { MantenimientoRepuesto };
