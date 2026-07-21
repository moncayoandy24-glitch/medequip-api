const pool = require('../config/database');
const { Equipo } = require('../entities/Equipo');

const fields = [
  'codigo_interno', 'nombre', 'tipo_equipo', 'marca', 'modelo', 'numero_serie', 'fabricante',
  'fecha_adquisicion', 'precio_adquisicion', 'vida_util_estimada', 'estado', 'categoria_id',
  'ubicacion_id', 'proveedor_id', 'servicio_hospitalario', 'nivel_riesgo',
  'fecha_ultimo_mantenimiento', 'fecha_proximo_mantenimiento', 'observaciones', 'imagen_url',
];
const select = `
  SELECT e.*, c.nombre AS categoria_nombre, u.nombre AS ubicacion_nombre, p.nombre AS proveedor_nombre
  FROM equipos e
  LEFT JOIN categorias_equipos c ON c.id = e.categoria_id
  LEFT JOIN ubicaciones u ON u.id = e.ubicacion_id
  LEFT JOIN proveedores p ON p.id = e.proveedor_id`;

const equipoRepository = {
  async findAll(filters = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const values = [];
    const conditions = [];
    const add = (sql, value) => { values.push(value); conditions.push(sql.replace('?', `$${values.length}`)); };

    add('e.activo = ?', filters.activo === undefined ? true : filters.activo);
    if (filters.estado) add('e.estado = ?', filters.estado);
    if (filters.riesgo) add('e.nivel_riesgo = ?', filters.riesgo);
    if (filters.tipo) add('e.tipo_equipo ILIKE ?', `%${filters.tipo}%`);
    if (filters.categoria) {
      values.push(filters.categoria, filters.categoria);
      conditions.push(`(e.categoria_id::text = $${values.length - 1} OR c.nombre ILIKE $${values.length})`);
    }
    if (filters.ubicacion) {
      values.push(filters.ubicacion, filters.ubicacion);
      conditions.push(`(e.ubicacion_id::text = $${values.length - 1} OR u.nombre ILIKE $${values.length})`);
    }
    if (filters.codigo) add('e.codigo_interno ILIKE ?', filters.codigo);
    if (filters.numero_serie) add('e.numero_serie ILIKE ?', filters.numero_serie);
    if (filters.search) {
      values.push(`%${filters.search}%`);
      const pos = values.length;
      conditions.push(`(e.nombre ILIKE $${pos} OR e.codigo_interno ILIKE $${pos} OR e.numero_serie ILIKE $${pos} OR e.marca ILIKE $${pos} OR e.modelo ILIKE $${pos})`);
    }
    const where = `WHERE ${conditions.join(' AND ')}`;
    const count = await pool.query(
      `SELECT COUNT(*) FROM equipos e LEFT JOIN categorias_equipos c ON c.id=e.categoria_id LEFT JOIN ubicaciones u ON u.id=e.ubicacion_id ${where}`,
      values
    );
    const allowedSort = { nombre: 'e.nombre', codigo: 'e.codigo_interno', estado: 'e.estado', riesgo: 'e.nivel_riesgo', created_at: 'e.created_at' };
    const orderBy = allowedSort[filters.sort] || 'e.created_at';
    const direction = String(filters.order || '').toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    values.push(limit, (page - 1) * limit);
    const result = await pool.query(
      `${select} ${where} ORDER BY ${orderBy} ${direction} LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );
    return { rows: Equipo.fromRows(result.rows), total: Number(count.rows[0].count) };
  },
  async findById(id) {
    const result = await pool.query(`${select} WHERE e.id = $1`, [id]);
    return Equipo.fromRow(result.rows[0]);
  },
  async findByUnique(field, value) {
    if (!['codigo_interno', 'numero_serie'].includes(field)) throw new Error('Campo no permitido');
    const result = await pool.query(`SELECT * FROM equipos WHERE LOWER(${field}) = LOWER($1)`, [value]);
    return Equipo.fromRow(result.rows[0]);
  },
  async create(data) {
    const entries = Object.entries(data).filter(([key, value]) => fields.includes(key) && value !== undefined);
    const columns = entries.map(([key]) => key);
    const values = entries.map(([, value]) => value === '' ? null : value);
    const result = await pool.query(
      `INSERT INTO equipos (${columns.join(', ')}) VALUES (${values.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING id`, values
    );
    return this.findById(result.rows[0].id);
  },
  async update(id, data) {
    const entries = Object.entries(data).filter(([key, value]) => fields.includes(key) && value !== undefined);
    if (!entries.length) return this.findById(id);
    const values = entries.map(([, value]) => value === '' ? null : value);
    const sets = entries.map(([key], i) => `${key} = $${i + 1}`);
    values.push(id);
    await pool.query(`UPDATE equipos SET ${sets.join(', ')} WHERE id = $${values.length}`, values);
    return this.findById(id);
  },
  async setEstado(id, estado) {
    await pool.query('UPDATE equipos SET estado = $1 WHERE id = $2', [estado, id]);
    return this.findById(id);
  },
  async softDelete(id) {
    await pool.query("UPDATE equipos SET activo = FALSE, estado = 'dado_de_baja' WHERE id = $1", [id]);
    return this.findById(id);
  },
};

module.exports = { equipoRepository };
