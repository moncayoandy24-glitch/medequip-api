const { createCatalogRepository } = require('./catalogRepository');
const { CategoriaEquipo } = require('../entities/CategoriaEquipo');
const categoriaRepository = createCatalogRepository({
  table: 'categorias_equipos', fields: ['nombre', 'descripcion'], Entity: CategoriaEquipo,
});
module.exports = { categoriaRepository };
