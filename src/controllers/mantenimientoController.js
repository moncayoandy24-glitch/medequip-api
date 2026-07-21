const {body,param,query}=require('express-validator');
const {mantenimientoService}=require('../services/mantenimientoService');
const {asyncHandler}=require('../utils/asyncHandler');const {success}=require('../utils/response');
const {Mantenimiento}=require('../entities/Mantenimiento');
const tipos=Mantenimiento.TIPOS;const estados=Mantenimiento.ESTADOS;
const mantenimientoController={
  listar:asyncHandler(async(req,res)=>{const page=Number(req.query.page||1),limit=Number(req.query.limit||10);const r=await mantenimientoService.obtenerTodos({...req.query,page,limit});return success(res,{message:'Mantenimientos obtenidos correctamente',data:r.rows,pagination:{page,limit,total:r.total,totalPages:Math.ceil(r.total/limit)}})}),
  obtener:asyncHandler(async(req,res)=>success(res,{message:'Mantenimiento obtenido correctamente',data:await mantenimientoService.obtenerPorId(req.params.id)})),
  crear:asyncHandler(async(req,res)=>success(res,{status:201,message:'Mantenimiento programado correctamente',data:await mantenimientoService.crear(req.body,req.user.id)})),
  actualizar:asyncHandler(async(req,res)=>success(res,{message:'Mantenimiento actualizado correctamente',data:await mantenimientoService.actualizar(req.params.id,req.body)})),
  estado:asyncHandler(async(req,res)=>success(res,{message:'Estado del mantenimiento actualizado correctamente',data:await mantenimientoService.cambiarEstado(req.params.id,req.body)})),
  proximos:asyncHandler(async(req,res)=>success(res,{message:'Mantenimientos próximos obtenidos correctamente',data:await mantenimientoService.proximos(Number(req.query.dias||30))})),
  vencidos:asyncHandler(async(req,res)=>success(res,{message:'Mantenimientos vencidos obtenidos correctamente',data:await mantenimientoService.vencidos()})),
  historial:asyncHandler(async(req,res)=>success(res,{message:'Historial de mantenimientos obtenido correctamente',data:await mantenimientoService.historialEquipo(req.params.id)})),
  agregarRepuesto:asyncHandler(async(req,res)=>success(res,{message:'Repuesto asociado correctamente',data:await mantenimientoService.agregarRepuesto(req.params.id,req.body)})),
};
const optText=f=>body(f).optional({nullable:true}).isString();const opc=[body('tipo').optional().isIn(tipos),body('fecha_programada').optional().isISO8601(),body('fecha_realizacion').optional({nullable:true}).isISO8601(),body('tecnico_id').optional({nullable:true}).isUUID(),optText('descripcion_trabajo'),optText('diagnostico'),optText('actividades_realizadas'),body('costo').optional().isFloat({min:0}).toFloat(),optText('resultado'),body('estado').optional().isIn(estados),body('proxima_fecha_mantenimiento').optional({nullable:true}).isISO8601(),optText('observaciones')];
const validaciones={
 listar:[query('page').optional().isInt({min:1}),query('limit').optional().isInt({min:1,max:100}),query('estado').optional().isIn(estados),query('tipo').optional().isIn(tipos),query('equipo_id').optional().isUUID(),query('desde').optional().isISO8601(),query('hasta').optional().isISO8601()],
 obtener:[param('id').isUUID()],
 crear:[body('equipo_id').isUUID(),body('tipo').isIn(tipos),body('fecha_programada').isISO8601(),...opc.slice(2)],
 actualizar:[param('id').isUUID(),...opc.filter((_,i)=>i!==9)],
 estado:[param('id').isUUID(),body('estado').isIn(estados),body('resultado').optional({nullable:true}).isString(),body('fecha_realizacion').optional({nullable:true}).isISO8601(),body('proxima_fecha_mantenimiento').optional({nullable:true}).isISO8601(),body('observaciones').optional({nullable:true}).isString()],
 repuesto:[param('id').isUUID(),body('repuesto_id').isUUID(),body('cantidad').isInt({min:1}).toInt()],
 dias:[query('dias').optional().isInt({min:1,max:365})],
};
module.exports={mantenimientoController,validaciones};
