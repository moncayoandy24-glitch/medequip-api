const { createCatalogRepository } = require('./catalogRepository');
const { Ubicacion } = require('../entities/Ubicacion');
const ubicacionRepository = createCatalogRepository({
  table: 'ubicaciones',
  fields: ['nombre', 'piso', 'numero_habitacion', 'responsable', 'descripcion'],
  searchFields: ['nombre', 'responsable'],
  Entity: Ubicacion,
});
module.exports = { ubicacionRepository };
