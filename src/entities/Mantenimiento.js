const { BaseEntity } = require('./BaseEntity');
class Mantenimiento extends BaseEntity {
  static TIPOS = ['preventivo', 'correctivo', 'predictivo', 'calibracion', 'inspeccion', 'instalacion'];
  static ESTADOS = ['programado', 'en_proceso', 'completado', 'cancelado', 'pendiente'];
  constructor(data = {}) { super(data, ['id', 'equipo_id', 'tipo', 'fecha_programada', 'fecha_realizacion', 'tecnico_id', 'descripcion_trabajo', 'diagnostico', 'actividades_realizadas', 'costo', 'resultado', 'estado', 'proxima_fecha_mantenimiento', 'observaciones', 'created_by', 'created_at', 'updated_at', 'codigo_interno', 'equipo_nombre', 'tecnico_nombre', 'repuestos']); }
  estaFinalizado() { return ['completado', 'cancelado'].includes(this.estado); }
  puedeCompletarse({ resultado, fecha_realizacion } = {}) { return !this.estaFinalizado() && Boolean(resultado && fecha_realizacion); }
}
module.exports = { Mantenimiento };
