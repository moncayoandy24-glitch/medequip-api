const { BaseEntity } = require('./BaseEntity');
class Notificacion extends BaseEntity {
  constructor(data = {}) { super(data, ['id', 'usuario_id', 'tipo', 'titulo', 'mensaje', 'referencia_id', 'leida', 'created_at']); }
  estaLeida() { return this.leida === true; }
}
module.exports = { Notificacion };
