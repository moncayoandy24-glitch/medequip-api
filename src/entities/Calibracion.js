const { BaseEntity } = require('./BaseEntity');
class Calibracion extends BaseEntity {
  static RESULTADOS = ['aprobado', 'rechazado', 'condicional'];
  static ESTADOS = ['vigente', 'vencida', 'cancelada'];
  constructor(data = {}) { super(data, ['id', 'equipo_id', 'fecha', 'tecnico_id', 'empresa', 'certificado_url', 'resultado', 'parametros_evaluados', 'proxima_fecha', 'estado', 'observaciones', 'created_by', 'created_at', 'updated_at', 'codigo_interno', 'equipo_nombre', 'tecnico_nombre']); }
  estaVencida(fecha = new Date()) { return this.estado === 'vencida' || Boolean(this.proxima_fecha && new Date(this.proxima_fecha) < fecha); }
}
module.exports = { Calibracion };
