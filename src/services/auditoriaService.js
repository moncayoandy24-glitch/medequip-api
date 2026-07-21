const {auditoriaRepository}=require('../repositories/auditoriaRepository');const auditoriaService={listar:f=>auditoriaRepository.findAll(f)};module.exports={auditoriaService};
