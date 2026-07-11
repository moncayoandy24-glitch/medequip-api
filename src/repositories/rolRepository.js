const pool = require('../config/database');

const rolRepository = {
  async findAll() {
    const result = await pool.query('SELECT * FROM roles ORDER BY nombre');
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM roles WHERE id = $1', [id]);
    return result.rows[0];
  },

  async findByName(nombre) {
    const result = await pool.query('SELECT * FROM roles WHERE nombre = $1', [nombre]);
    return result.rows[0];
  },

  async create(data) {
    const { nombre, descripcion } = data;
    const result = await pool.query(
      'INSERT INTO roles (nombre, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre, descripcion]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const { nombre, descripcion } = data;
    const result = await pool.query(
      'UPDATE roles SET nombre = $1, descripcion = $2 WHERE id = $3 RETURNING *',
      [nombre, descripcion, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query('DELETE FROM roles WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  },
};

module.exports = { rolRepository };
