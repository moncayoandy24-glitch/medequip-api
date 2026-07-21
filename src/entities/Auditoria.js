const { BaseEntity } = require('./BaseEntity');
class Auditoria extends BaseEntity {
  constructor(data = {}) { super(data, ['id', 'usuario_id', 'accion', 'modulo', 'registro_id', 'datos_anteriores', 'datos_nuevos', 'ip', 'created_at', 'usuario_nombre', 'usuario_email']); }
}
module.exports = { Auditoria };
