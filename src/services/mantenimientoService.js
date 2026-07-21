const {mantenimientoRepository}=require('../repositories/mantenimientoRepository');
const {equipoRepository}=require('../repositories/equipoRepository');
const {usuarioRepository}=require('../repositories/usuarioRepository');
const {AppError}=require('../utils/appError');

const mantenimientoService={
  async obtenerTodos(f){await mantenimientoRepository.refreshOverdue();return mantenimientoRepository.findAll(f);},
  async obtenerPorId(id){const row=await mantenimientoRepository.findById(id);if(!row)throw new AppError('Mantenimiento no encontrado',404);return row;},
  async historialEquipo(equipoId){if(!await equipoRepository.findById(equipoId))throw new AppError('Equipo no encontrado',404);return mantenimientoRepository.findByEquipo(equipoId);},
  async proximos(days){await mantenimientoRepository.refreshOverdue();return mantenimientoRepository.findUpcoming(days);},
  async vencidos(){await mantenimientoRepository.refreshOverdue();return mantenimientoRepository.findOverdue();},
  async validar(data){const equipo=await equipoRepository.findById(data.equipo_id);if(!equipo?.activo)throw new AppError('Equipo no válido',400);if(data.tecnico_id&&!await usuarioRepository.findById(data.tecnico_id))throw new AppError('Técnico no válido',400);},
  async crear(data,usuarioId){await this.validar(data);if(new Date(data.fecha_programada)<new Date(new Date().toDateString())&&!data.estado)data.estado='pendiente';return mantenimientoRepository.create({...data,created_by:usuarioId});},
  async actualizar(id,data){const actual=await this.obtenerPorId(id);if(actual.estaFinalizado())throw new AppError('No se puede editar un mantenimiento finalizado',409);const {estado,...cambios}=data;await this.validar({...actual,...cambios});return mantenimientoRepository.update(id,cambios);},
  async cambiarEstado(id,data){const actual=await this.obtenerPorId(id);if(actual.estaFinalizado())throw new AppError('El mantenimiento ya está finalizado',409);if(data.estado==='completado'&&!actual.puedeCompletarse(data))throw new AppError('Para completar se requiere resultado y fecha de realización',422);await mantenimientoRepository.update(id,data);if(data.estado==='en_proceso')await mantenimientoRepository.syncEquipo(actual.equipo_id,{estado:'en_mantenimiento'});if(data.estado==='completado')await mantenimientoRepository.syncEquipo(actual.equipo_id,{estado:'operativo',fechaRealizacion:data.fecha_realizacion,proximaFecha:data.proxima_fecha_mantenimiento});if(data.estado==='cancelado')await mantenimientoRepository.syncEquipo(actual.equipo_id,{estado:'operativo'});return mantenimientoRepository.findById(id);},
  async agregarRepuesto(id,{repuesto_id,cantidad}){const m=await this.obtenerPorId(id);if(m.estaFinalizado())throw new AppError('No se pueden agregar repuestos a un mantenimiento finalizado',409);try{return await mantenimientoRepository.addRepuesto(id,repuesto_id,cantidad);}catch(e){if(e.message==='STOCK_INSUFICIENTE')throw new AppError('Stock insuficiente',409);if(e.message==='REPUESTO_NO_EXISTE')throw new AppError('Repuesto no encontrado o inactivo',404);throw e;}},
};
module.exports={mantenimientoService};
