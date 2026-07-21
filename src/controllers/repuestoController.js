const { body, param, query } = require('express-validator');
const { repuestoService } = require('../services/repuestoService');
const { asyncHandler } = require('../utils/asyncHandler');
const { success } = require('../utils/response');

const repuestoController = {
  listar: asyncHandler(async (req, res) => { const page=Number(req.query.page||1); const limit=Number(req.query.limit||10); const r=await repuestoService.obtenerTodos({page,limit,search:req.query.search||'',activo:req.query.activo===undefined?true:req.query.activo==='true'}); return success(res,{message:'Repuestos obtenidos correctamente',data:r.rows,pagination:{page,limit,total:r.total,totalPages:Math.ceil(r.total/limit)}}); }),
  obtener: asyncHandler(async (req,res)=>success(res,{message:'Repuesto obtenido correctamente',data:await repuestoService.obtenerPorId(req.params.id)})),
  bajoStock: asyncHandler(async (req,res)=>success(res,{message:'Repuestos con bajo stock obtenidos correctamente',data:await repuestoService.obtenerBajoStock()})),
  crear: asyncHandler(async (req,res)=>success(res,{status:201,message:'Repuesto registrado correctamente',data:await repuestoService.crear(req.body)})),
  actualizar: asyncHandler(async (req,res)=>success(res,{message:'Repuesto actualizado correctamente',data:await repuestoService.actualizar(req.params.id,req.body)})),
  stock: asyncHandler(async (req,res)=>success(res,{message:'Stock actualizado correctamente',data:await repuestoService.actualizarStock(req.params.id,req.body)})),
  estado: asyncHandler(async (req,res)=>success(res,{message:'Estado del repuesto actualizado correctamente',data:await repuestoService.cambiarEstado(req.params.id,req.body.activo)})),
};
const optText=(f,max)=>body(f).optional({nullable:true}).trim().isLength({max});
const fields=[optText('descripcion',2000),body('cantidad_disponible').optional().isInt({min:0}).toInt(),body('stock_minimo').optional().isInt({min:0}).toInt(),body('precio').optional().isFloat({min:0}).toFloat(),body('proveedor_id').optional({nullable:true}).isUUID()];
const validaciones={
  listar:[query('page').optional().isInt({min:1}),query('limit').optional().isInt({min:1,max:100}),query('search').optional().isLength({max:100}),query('activo').optional().isBoolean()],
  obtener:[param('id').isUUID()],
  crear:[body('nombre').trim().notEmpty().isLength({max:150}),body('codigo').trim().notEmpty().isLength({max:60}),...fields],
  actualizar:[param('id').isUUID(),body('nombre').optional().trim().notEmpty().isLength({max:150}),body('codigo').optional().trim().notEmpty().isLength({max:60}),...fields.filter((v,i)=>i!==1)],
  stock:[param('id').isUUID(),body('tipo').isIn(['entrada','salida','ajuste']),body('cantidad').isInt({min:0}).toInt()],
  estado:[param('id').isUUID(),body('activo').isBoolean().toBoolean()],
};
module.exports={repuestoController,validaciones};
