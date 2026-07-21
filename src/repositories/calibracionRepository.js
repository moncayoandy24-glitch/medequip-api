const pool=require('../config/database');
const {Calibracion}=require('../entities/Calibracion');
const fields=['equipo_id','fecha','tecnico_id','empresa','certificado_url','resultado','parametros_evaluados','proxima_fecha','estado','observaciones'];
const select=`SELECT c.*,e.codigo_interno,e.nombre AS equipo_nombre,u.nombre AS tecnico_nombre FROM calibraciones c JOIN equipos e ON e.id=c.equipo_id LEFT JOIN usuarios u ON u.id=c.tecnico_id`;
const calibracionRepository={
 async refresh(){await pool.query("UPDATE calibraciones SET estado='vencida' WHERE estado='vigente' AND proxima_fecha<CURRENT_DATE");},
 async findAll({page=1,limit=10,equipo_id,estado}={}){const vals=[],conds=[];if(equipo_id){vals.push(equipo_id);conds.push(`c.equipo_id=$${vals.length}`)}if(estado){vals.push(estado);conds.push(`c.estado=$${vals.length}`)}const where=conds.length?`WHERE ${conds.join(' AND ')}`:'';const count=await pool.query(`SELECT COUNT(*) FROM calibraciones c ${where}`,vals);vals.push(limit,(page-1)*limit);const r=await pool.query(`${select} ${where} ORDER BY c.fecha DESC LIMIT $${vals.length-1} OFFSET $${vals.length}`,vals);return{rows:Calibracion.fromRows(r.rows),total:Number(count.rows[0].count)}} ,
 async findById(id){const r=await pool.query(`${select} WHERE c.id=$1`,[id]);return Calibracion.fromRow(r.rows[0])},
 async findUpcoming(days=30){const r=await pool.query(`${select} WHERE c.estado='vigente' AND c.proxima_fecha BETWEEN CURRENT_DATE AND CURRENT_DATE+$1::int ORDER BY c.proxima_fecha`,[days]);return Calibracion.fromRows(r.rows)},
 async findOverdue(){const r=await pool.query(`${select} WHERE c.proxima_fecha<CURRENT_DATE AND c.estado='vencida' ORDER BY c.proxima_fecha`);return Calibracion.fromRows(r.rows)},
 async create(data){const entries=Object.entries(data).filter(([k,v])=>[...fields,'created_by'].includes(k)&&v!==undefined);const r=await pool.query(`INSERT INTO calibraciones(${entries.map(([k])=>k).join(',')}) VALUES(${entries.map((_,i)=>`$${i+1}`).join(',')}) RETURNING id`,entries.map(([,v])=>v===''?null:v));return this.findById(r.rows[0].id)},
 async update(id,data){const entries=Object.entries(data).filter(([k,v])=>fields.includes(k)&&v!==undefined);if(!entries.length)return this.findById(id);const vals=entries.map(([,v])=>v===''?null:v);vals.push(id);await pool.query(`UPDATE calibraciones SET ${entries.map(([k],i)=>`${k}=$${i+1}`).join(',')} WHERE id=$${vals.length}`,vals);return this.findById(id)},
};module.exports={calibracionRepository};
