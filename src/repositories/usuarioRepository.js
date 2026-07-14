const pool = require('../config/database');

const usuarioRepository = {
  async findAll() {
    const result = await pool.query(
      'SELECT u.id, u.nombre, u.email, u.activo, u.created_at, u.updated_at, array_agg(r.nombre) as roles FROM usuarios u LEFT JOIN usuario_roles ur ON u.id = ur.usuario_id LEFT JOIN roles r ON ur.rol_id = r.id GROUP BY u.id ORDER BY u.created_at DESC'
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      'SELECT u.id, u.nombre, u.email, u.activo, u.created_at, u.updated_at, array_agg(r.nombre) as roles FROM usuarios u LEFT JOIN usuario_roles ur ON u.id = ur.usuario_id LEFT JOIN roles r ON ur.rol_id = r.id WHERE u.id = $1 GROUP BY u.id',
      [id]
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    return result.rows[0];
  },

  async create(data, client = pool) {
    const { nombre, email, password_hash } = data;
    const result = await client.query(
      'INSERT INTO usuarios (nombre, email, password_hash) VALUES ($1, $2, $3) RETURNING id, nombre, email, activo, created_at, updated_at',
      [nombre, email, password_hash]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let index = 1;

    Object.keys(data).forEach((key) => {
      if (key !== 'password_hash' || data[key]) {
        fields.push(`${key} = $${index}`);
        values.push(data[key]);
        index++;
      }
    });

    if (!fields.length) return null;

    values.push(id);
    const query = `UPDATE usuarios SET ${fields.join(', ')} WHERE id = $${index} RETURNING id, nombre, email, activo, created_at, updated_at`;
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async updatePassword(id, password_hash) {
    const result = await pool.query(
      'UPDATE usuarios SET password_hash = $1 WHERE id = $2 RETURNING id',
      [password_hash, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  },

  async asignarRol(usuarioId, rolId, client = pool) {
    const result = await client.query(
      'INSERT INTO usuario_roles (usuario_id, rol_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
      [usuarioId, rolId]
    );
    return result.rows[0];
  },

  async removerRol(usuarioId, rolId) {
    const result = await pool.query(
      'DELETE FROM usuario_roles WHERE usuario_id = $1 AND rol_id = $2 RETURNING *',
      [usuarioId, rolId]
    );
    return result.rows[0];
  },
};

module.exports = { usuarioRepository };
