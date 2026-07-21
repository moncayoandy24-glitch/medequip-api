const pool = require('../config/database');
const { createCatalogRepository } = require('./catalogRepository');
const { Proveedor } = require('../entities/Proveedor');
const proveedorRepository = {
  ...createCatalogRepository({
    table: 'proveedores',
    fields: ['nombre', 'ruc', 'email', 'telefono', 'direccion', 'persona_contacto'],
    searchFields: ['nombre', 'ruc', 'persona_contacto'],
    Entity: Proveedor,
  }),
  async findEquipos(id) {
    const result = await pool.query(
      `SELECT id, codigo_interno, nombre, marca, modelo, numero_serie, estado
       FROM equipos WHERE proveedor_id = $1 AND activo = TRUE ORDER BY nombre`, [id]
    );
    return result.rows;
  },
};
module.exports = { proveedorRepository };
