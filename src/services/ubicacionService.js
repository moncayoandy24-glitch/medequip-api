const { createCatalogService } = require('./catalogService');
const { ubicacionRepository } = require('../repositories/ubicacionRepository');
const ubicacionService = createCatalogService({ repository: ubicacionRepository, nombreRecurso: 'Ubicación' });
module.exports = { ubicacionService };
