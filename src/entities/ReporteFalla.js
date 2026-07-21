const { BaseEntity } = require('./BaseEntity');
class ReporteFalla extends BaseEntity {
  static PRIORIDADES = ['baja', 'media', 'alta', 'critica'];
  static ESTADOS = ['reportada', 'revisada', 'en_reparacion', 'resuelta', 'cerrada', 'rechazada'];
  constructor(data = {}) { super(data, ['id', 'equipo_id', 'reportado_por', 'descripcion', 'prioridad', 'evidencia_url', 'estado', 'tecnico_asignado_id', 'solucion', 'fecha_cierre', 'created_at', 'updated_at', 'codigo_interno', 'equipo_nombre', 'reportado_por_nombre', 'tecnico_nombre']); }
  estaFinalizada() { return ['cerrada', 'rechazada'].includes(this.estado); }
  esCritica() { return this.prioridad === 'critica'; }
  puedeCerrarse(solucion) { return !this.estaFinalizada() && Boolean(solucion); }
}
module.exports = { ReporteFalla };
