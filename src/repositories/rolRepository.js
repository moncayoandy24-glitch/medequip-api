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
    const fields = [];
    const values = [];
    let index = 1;

    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        fields.push(`${key} = $${index}`);
        values.push(data[key]);
        index++;
      }
    });

    if (!fields.length) return null;

    values.push(id);
    const query = `UPDATE roles SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query('DELETE FROM roles WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  },
};

module.exports = { rolRepository };
