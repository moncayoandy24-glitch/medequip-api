const {calibracionRepository}=require('../repositories/calibracionRepository');const {equipoRepository}=require('../repositories/equipoRepository');const {usuarioRepository}=require('../repositories/usuarioRepository');const {AppError}=require('../utils/appError');
const calibracionService={
 async listar(f){await calibracionRepository.refresh();return calibracionRepository.findAll(f)},
 async obtener(id){const r=await calibracionRepository.findById(id);if(!r)throw new AppError('Calibración no encontrada',404);return r},
 async validar(data){const e=await equipoRepository.findById(data.equipo_id);if(!e?.activo)throw new AppError('Equipo no válido',400);if(data.tecnico_id&&!await usuarioRepository.findById(data.tecnico_id))throw new AppError('Técnico no válido',400)},
 async crear(data,userId){await this.validar(data);const hoy=new Date();hoy.setHours(0,0,0,0);if(data.proxima_fecha&&new Date(data.proxima_fecha)<hoy)data.estado='vencida';return calibracionRepository.create({...data,created_by:userId})},
 async actualizar(id,data){const a=await this.obtener(id);await this.validar({...a,...data});return calibracionRepository.update(id,data)},
 async proximas(d){await calibracionRepository.refresh();return calibracionRepository.findUpcoming(d)},async vencidas(){await calibracionRepository.refresh();return calibracionRepository.findOverdue()},
};module.exports={calibracionService};
