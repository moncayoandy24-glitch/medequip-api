const { BaseEntity } = require('./BaseEntity');
class UsuarioRol extends BaseEntity {
  constructor(data = {}) { super(data, ['usuario_id', 'rol_id', 'created_at']); }
}
module.exports = { UsuarioRol };
