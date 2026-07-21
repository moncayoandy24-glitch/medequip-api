const pool = require('../config/database');

const createCatalogRepository = ({ table, fields, searchFields = ['nombre'], Entity }) => ({
  async findAll({ page = 1, limit = 10, search = '', activo } = {}) {
    const values = [];
    const conditions = [];
    if (search) {
      values.push(`%${search}%`);
      conditions.push(`(${searchFields.map((field) => `${field} ILIKE $${values.length}`).join(' OR ')})`);
    }
    if (activo !== undefined) {
      values.push(activo);
      conditions.push(`activo = $${values.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const count = await pool.query(`SELECT COUNT(*) FROM ${table} ${where}`, values);
    values.push(limit, (page - 1) * limit);
    const result = await pool.query(
      `SELECT * FROM ${table} ${where} ORDER BY nombre LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );
    return { rows: Entity.fromRows(result.rows), total: Number(count.rows[0].count) };
  },
  async findById(id) {
    const result = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    return Entity.fromRow(result.rows[0]);
  },
  async findBy(field, value) {
    if (!fields.includes(field)) throw new Error('Campo de búsqueda no permitido');
    const result = await pool.query(`SELECT * FROM ${table} WHERE LOWER(${field}) = LOWER($1)`, [value]);
    return Entity.fromRow(result.rows[0]);
  },
  async create(data) {
    const entries = Object.entries(data).filter(([key, value]) => fields.includes(key) && value !== undefined);
    const columns = entries.map(([key]) => key);
    const values = entries.map(([, value]) => value === '' ? null : value);
    const placeholders = values.map((_, index) => `$${index + 1}`);
    const result = await pool.query(
      `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`, values
    );
    return Entity.fromRow(result.rows[0]);
  },
  async update(id, data) {
    const entries = Object.entries(data).filter(([key, value]) => fields.includes(key) && value !== undefined);
    if (!entries.length) return this.findById(id);
    const values = entries.map(([, value]) => value === '' ? null : value);
    const sets = entries.map(([key], index) => `${key} = $${index + 1}`);
    values.push(id);
    const result = await pool.query(
      `UPDATE ${table} SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`, values
    );
    return Entity.fromRow(result.rows[0]);
  },
  async setActive(id, activo) {
    const result = await pool.query(`UPDATE ${table} SET activo = $1 WHERE id = $2 RETURNING *`, [activo, id]);
    return Entity.fromRow(result.rows[0]);
  },
});

module.exports = { createCatalogRepository };
