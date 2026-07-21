const pool = require('../config/database');
const { Rol } = require('../entities/Rol');

const rolRepository = {
  async findAll() {
    const result = await pool.query('SELECT * FROM roles ORDER BY nombre');
    return Rol.fromRows(result.rows);
  },
  async findById(id) {
    const result = await pool.query('SELECT * FROM roles WHERE id = $1', [id]);
    return Rol.fromRow(result.rows[0]);
  },
  async findByName(nombre) {
    const result = await pool.query('SELECT * FROM roles WHERE LOWER(nombre) = LOWER($1)', [nombre]);
    return Rol.fromRow(result.rows[0]);
  },
  async create({ nombre, descripcion }) {
    const result = await pool.query(
      'INSERT INTO roles (nombre, descripcion) VALUES (LOWER($1), $2) RETURNING *',
      [nombre, descripcion || null]
    );
    return Rol.fromRow(result.rows[0]);
  },
  async update(id, data) {
    const entries = Object.entries(data).filter(([key, value]) => ['nombre', 'descripcion'].includes(key) && value !== undefined);
    if (!entries.length) return this.findById(id);
    const values = entries.map(([key, value]) => key === 'nombre' ? value.toLowerCase() : value);
    const fields = entries.map(([key], index) => `${key} = $${index + 1}`);
    values.push(id);
    const result = await pool.query(
      `UPDATE roles SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );
    return Rol.fromRow(result.rows[0]);
  },
  async setActive(id, activo) {
    const result = await pool.query('UPDATE roles SET activo = $1 WHERE id = $2 RETURNING *', [activo, id]);
    return Rol.fromRow(result.rows[0]);
  },
};

module.exports = { rolRepository };
