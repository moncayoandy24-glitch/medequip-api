const pool = require('../config/database');
const { Repuesto } = require('../entities/Repuesto');
const fields = ['nombre', 'codigo', 'descripcion', 'cantidad_disponible', 'stock_minimo', 'precio', 'proveedor_id'];
const select = `SELECT r.*, p.nombre AS proveedor_nombre FROM repuestos r LEFT JOIN proveedores p ON p.id=r.proveedor_id`;

const repuestoRepository = {
  async findAll({ page = 1, limit = 10, search = '', activo = true } = {}) {
    const values = [activo];
    const conditions = ['r.activo = $1'];
    if (search) { values.push(`%${search}%`); conditions.push(`(r.nombre ILIKE $${values.length} OR r.codigo ILIKE $${values.length})`); }
    const where = `WHERE ${conditions.join(' AND ')}`;
    const count = await pool.query(`SELECT COUNT(*) FROM repuestos r ${where}`, values);
    values.push(limit, (page - 1) * limit);
    const result = await pool.query(`${select} ${where} ORDER BY r.nombre LIMIT $${values.length - 1} OFFSET $${values.length}`, values);
    return { rows: Repuesto.fromRows(result.rows), total: Number(count.rows[0].count) };
  },
  async findById(id) {
    const result = await pool.query(`${select} WHERE r.id=$1`, [id]);
    return Repuesto.fromRow(result.rows[0]);
  },
  async findByCode(codigo) {
    const result = await pool.query('SELECT * FROM repuestos WHERE LOWER(codigo)=LOWER($1)', [codigo]);
    return Repuesto.fromRow(result.rows[0]);
  },
  async findLowStock() {
    const result = await pool.query(`${select} WHERE r.activo=TRUE AND r.cantidad_disponible <= r.stock_minimo ORDER BY r.cantidad_disponible`);
    return Repuesto.fromRows(result.rows);
  },
  async create(data) {
    const entries = Object.entries(data).filter(([key, value]) => fields.includes(key) && value !== undefined);
    const result = await pool.query(
      `INSERT INTO repuestos (${entries.map(([key]) => key).join(',')}) VALUES (${entries.map((_, i) => `$${i + 1}`).join(',')}) RETURNING id`,
      entries.map(([, value]) => value === '' ? null : value)
    );
    return this.findById(result.rows[0].id);
  },
  async update(id, data) {
    const entries = Object.entries(data).filter(([key, value]) => fields.includes(key) && value !== undefined && key !== 'cantidad_disponible');
    if (!entries.length) return this.findById(id);
    const values = entries.map(([, value]) => value === '' ? null : value);
    values.push(id);
    await pool.query(`UPDATE repuestos SET ${entries.map(([key], i) => `${key}=$${i + 1}`).join(',')} WHERE id=$${values.length}`, values);
    return this.findById(id);
  },
  async changeStock(id, delta) {
    const result = await pool.query(
      'UPDATE repuestos SET cantidad_disponible=cantidad_disponible+$1 WHERE id=$2 AND cantidad_disponible+$1 >= 0 RETURNING id',
      [delta, id]
    );
    return result.rows[0] ? this.findById(id) : null;
  },
  async setStock(id, cantidad) {
    const result = await pool.query('UPDATE repuestos SET cantidad_disponible=$1 WHERE id=$2 RETURNING id', [cantidad, id]);
    return result.rows[0] ? this.findById(id) : null;
  },
  async setActive(id, activo) {
    await pool.query('UPDATE repuestos SET activo=$1 WHERE id=$2', [activo, id]);
    return this.findById(id);
  },
};
module.exports = { repuestoRepository };
