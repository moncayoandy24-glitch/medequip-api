const { BaseEntity } = require('./BaseEntity');
class Equipo extends BaseEntity {
  static ESTADOS = ['operativo', 'en_mantenimiento', 'fuera_de_servicio', 'dado_de_baja', 'en_reparacion', 'disponible', 'prestado'];
  static RIESGOS = ['bajo', 'medio', 'alto', 'critico'];
  constructor(data = {}) {
    super(data, ['id', 'codigo_interno', 'nombre', 'tipo_equipo', 'marca', 'modelo', 'numero_serie', 'fabricante', 'fecha_adquisicion', 'precio_adquisicion', 'vida_util_estimada', 'estado', 'categoria_id', 'ubicacion_id', 'proveedor_id', 'servicio_hospitalario', 'nivel_riesgo', 'fecha_ultimo_mantenimiento', 'fecha_proximo_mantenimiento', 'observaciones', 'imagen_url', 'activo', 'created_at', 'updated_at', 'categoria_nombre', 'ubicacion_nombre', 'proveedor_nombre']);
  }
  estaActivo() { return this.activo === true; }
  puedePrestarse() { return this.estaActivo() && ['operativo', 'disponible'].includes(this.estado); }
  estaDadoDeBaja() { return !this.estaActivo() || this.estado === 'dado_de_baja'; }
}
module.exports = { Equipo };
