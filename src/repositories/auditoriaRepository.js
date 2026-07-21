const pool = require('../config/database');
const { Auditoria } = require('../entities/Auditoria');

const auditoriaRepository = {
  async create({ usuario_id, accion, modulo, registro_id, datos_anteriores, datos_nuevos, ip }) {
    const result = await pool.query(
      `INSERT INTO auditorias (usuario_id, accion, modulo, registro_id, datos_anteriores, datos_nuevos, ip)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [usuario_id || null, accion, modulo, registro_id || null, datos_anteriores || null, datos_nuevos || null, ip || null]
    );
    return Auditoria.fromRow(result.rows[0]);
  },
  async findAll({ page = 1, limit = 20, modulo, usuario_id } = {}) {
    const values = [];
    const conditions = [];
    if (modulo) { values.push(modulo); conditions.push(`a.modulo = $${values.length}`); }
    if (usuario_id) { values.push(usuario_id); conditions.push(`a.usuario_id = $${values.length}`); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const count = await pool.query(`SELECT COUNT(*) FROM auditorias a ${where}`, values);
    values.push(limit, (page - 1) * limit);
    const result = await pool.query(
      `SELECT a.*, u.nombre AS usuario_nombre, u.email AS usuario_email
       FROM auditorias a LEFT JOIN usuarios u ON u.id=a.usuario_id ${where}
       ORDER BY a.created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );
    return { rows: Auditoria.fromRows(result.rows), total: Number(count.rows[0].count) };
  },
};

module.exports = { auditoriaRepository };
