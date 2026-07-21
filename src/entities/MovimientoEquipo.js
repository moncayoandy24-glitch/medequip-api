const { BaseEntity } = require('./BaseEntity');
class MovimientoEquipo extends BaseEntity {
  static TIPOS = ['traslado', 'prestamo'];
  static ESTADOS = ['activo', 'devuelto', 'completado', 'cancelado'];
  constructor(data = {}) { super(data, ['id', 'equipo_id', 'tipo', 'ubicacion_origen_id', 'ubicacion_destino_id', 'responsable_entrega_id', 'responsable_recibe_id', 'fecha_salida', 'fecha_prevista_devolucion', 'fecha_real_devolucion', 'motivo', 'estado', 'observaciones', 'estado_equipo_anterior', 'created_by', 'created_at', 'updated_at', 'codigo_interno', 'equipo_nombre', 'ubicacion_origen', 'ubicacion_destino', 'responsable_entrega', 'responsable_recibe']); }
  esPrestamoActivo() { return this.tipo === 'prestamo' && this.estado === 'activo'; }
  estaVencido(fecha = new Date()) { return this.esPrestamoActivo() && Boolean(this.fecha_prevista_devolucion && new Date(this.fecha_prevista_devolucion) < fecha); }
}
module.exports = { MovimientoEquipo };
