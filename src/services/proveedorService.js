const { createCatalogService } = require('./catalogService');
const { proveedorRepository } = require('../repositories/proveedorRepository');
const base = createCatalogService({ repository: proveedorRepository, nombreRecurso: 'Proveedor', uniqueFields: ['ruc'] });
const proveedorService = {
  ...base,
  async obtenerEquipos(id) {
    await base.obtenerPorId(id);
    return proveedorRepository.findEquipos(id);
  },
};
module.exports = { proveedorService };
