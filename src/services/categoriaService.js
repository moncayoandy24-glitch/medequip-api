const { createCatalogService } = require('./catalogService');
const { categoriaRepository } = require('../repositories/categoriaRepository');
const categoriaService = createCatalogService({ repository: categoriaRepository, nombreRecurso: 'Categoría' });
module.exports = { categoriaService };
