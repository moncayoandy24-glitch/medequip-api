const pool = require('../config/database');
const { Usuario } = require('../entities/Usuario');
const { UsuarioRol } = require('../entities/UsuarioRol');

const selectUsuario = `
  SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.cargo, u.activo,
         u.created_at, u.updated_at,
         COALESCE(array_agg(r.nombre) FILTER (WHERE r.nombre IS NOT NULL), '{}') AS roles
  FROM usuarios u
  LEFT JOIN usuario_roles ur ON u.id = ur.usuario_id
  LEFT JOIN roles r ON ur.rol_id = r.id AND r.activo = TRUE`;

const usuarioRepository = {
  async findAll({ page = 1, limit = 10, search = '', activo } = {}) {
    const values = [];
    const conditions = [];
    if (search) {
      values.push(`%${search}%`);
      conditions.push(`(u.nombre ILIKE $${values.length} OR u.apellido ILIKE $${values.length} OR u.email ILIKE $${values.length})`);
    }
    if (activo !== undefined) {
      values.push(activo);
      conditions.push(`u.activo = $${values.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countResult = await pool.query(`SELECT COUNT(*) FROM usuarios u ${where}`, values);
    values.push(limit, (page - 1) * limit);
    const result = await pool.query(
      `${selectUsuario} ${where} GROUP BY u.id ORDER BY u.created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );
    return { rows: Usuario.fromRows(result.rows), total: Number(countResult.rows[0].count) };
  },

  async findById(id) {
    const result = await pool.query(`${selectUsuario} WHERE u.id = $1 GROUP BY u.id`, [id]);
    return Usuario.fromRow(result.rows[0]);
  },

  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM usuarios WHERE LOWER(email) = LOWER($1)', [email]);
    return Usuario.fromRow(result.rows[0]);
  },

  async createWithRole(data, rolId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        `INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, cargo)
         VALUES ($1, $2, LOWER($3), $4, $5, $6)
         RETURNING id`,
        [data.nombre, data.apellido || null, data.email, data.password_hash, data.telefono || null, data.cargo || null]
      );
      if (rolId) {
        await client.query('INSERT INTO usuario_roles (usuario_id, rol_id) VALUES ($1, $2)', [result.rows[0].id, rolId]);
      }
      await client.query('COMMIT');
      return Usuario.fromRow(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async update(id, data) {
    const allowed = ['nombre', 'apellido', 'email', 'telefono', 'cargo', 'password_hash'];
    const entries = Object.entries(data).filter(([key, value]) => allowed.includes(key) && value !== undefined);
    if (!entries.length) return this.findById(id);
    const values = entries.map(([, value]) => value);
    const fields = entries.map(([key], index) => `${key} = $${index + 1}`);
    values.push(id);
    await pool.query(`UPDATE usuarios SET ${fields.join(', ')} WHERE id = $${values.length}`, values);
    return this.findById(id);
  },

  async setActive(id, activo) {
    const result = await pool.query(
      'UPDATE usuarios SET activo = $1 WHERE id = $2 RETURNING id',
      [activo, id]
    );
    return Usuario.fromRow(result.rows[0]);
  },

  async updatePassword(id, passwordHash) {
    const result = await pool.query(
      'UPDATE usuarios SET password_hash = $1 WHERE id = $2 RETURNING id',
      [passwordHash, id]
    );
    return Usuario.fromRow(result.rows[0]);
  },

  async asignarRol(usuarioId, rolId) {
    const result = await pool.query(
      'INSERT INTO usuario_roles (usuario_id, rol_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
      [usuarioId, rolId]
    );
    return UsuarioRol.fromRow(result.rows[0]);
  },
};

module.exports = { usuarioRepository };
