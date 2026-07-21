const pool = require('../config/database');
const { Mantenimiento } = require('../entities/Mantenimiento');
const fields=['equipo_id','tipo','fecha_programada','fecha_realizacion','tecnico_id','descripcion_trabajo','diagnostico','actividades_realizadas','costo','resultado','estado','proxima_fecha_mantenimiento','observaciones'];
const select=`SELECT m.*,e.codigo_interno,e.nombre AS equipo_nombre,u.nombre AS tecnico_nombre,
  COALESCE((SELECT json_agg(json_build_object('id',r.id,'codigo',r.codigo,'nombre',r.nombre,'cantidad',mr.cantidad,'precio_unitario',mr.precio_unitario)) FROM mantenimiento_repuestos mr JOIN repuestos r ON r.id=mr.repuesto_id WHERE mr.mantenimiento_id=m.id),'[]') AS repuestos
  FROM mantenimientos m JOIN equipos e ON e.id=m.equipo_id LEFT JOIN usuarios u ON u.id=m.tecnico_id`;

const mantenimientoRepository={
  async refreshOverdue(){await pool.query("UPDATE mantenimientos SET estado='pendiente' WHERE estado='programado' AND fecha_programada<CURRENT_DATE");},
  async findAll({page=1,limit=10,estado,tipo,equipo_id,desde,hasta}={}){
    const values=[];const conditions=[];const add=(sql,v)=>{values.push(v);conditions.push(sql.replace('?',`$${values.length}`));};
    if(estado)add('m.estado=?',estado);if(tipo)add('m.tipo=?',tipo);if(equipo_id)add('m.equipo_id=?',equipo_id);if(desde)add('m.fecha_programada>=?',desde);if(hasta)add('m.fecha_programada<=?',hasta);
    const where=conditions.length?`WHERE ${conditions.join(' AND ')}`:'';const count=await pool.query(`SELECT COUNT(*) FROM mantenimientos m ${where}`,values);
    values.push(limit,(page-1)*limit);const result=await pool.query(`${select} ${where} ORDER BY m.fecha_programada DESC LIMIT $${values.length-1} OFFSET $${values.length}`,values);
    return {rows:Mantenimiento.fromRows(result.rows),total:Number(count.rows[0].count)};
  },
  async findById(id){const r=await pool.query(`${select} WHERE m.id=$1`,[id]);return Mantenimiento.fromRow(r.rows[0]);},
  async findByEquipo(equipoId){const r=await pool.query(`${select} WHERE m.equipo_id=$1 ORDER BY m.fecha_programada DESC`,[equipoId]);return Mantenimiento.fromRows(r.rows);},
  async findUpcoming(days=30){const r=await pool.query(`${select} WHERE m.estado IN ('programado','pendiente') AND m.fecha_programada BETWEEN CURRENT_DATE AND CURRENT_DATE+$1::int ORDER BY m.fecha_programada`,[days]);return Mantenimiento.fromRows(r.rows);},
  async findOverdue(){const r=await pool.query(`${select} WHERE m.estado IN ('programado','pendiente') AND m.fecha_programada<CURRENT_DATE ORDER BY m.fecha_programada`);return Mantenimiento.fromRows(r.rows);},
  async create(data){const entries=Object.entries(data).filter(([k,v])=>[...fields,'created_by'].includes(k)&&v!==undefined);const r=await pool.query(`INSERT INTO mantenimientos (${entries.map(([k])=>k).join(',')}) VALUES (${entries.map((_,i)=>`$${i+1}`).join(',')}) RETURNING id`,entries.map(([,v])=>v===''?null:v));return this.findById(r.rows[0].id);},
  async update(id,data){const entries=Object.entries(data).filter(([k,v])=>fields.includes(k)&&v!==undefined);if(!entries.length)return this.findById(id);const values=entries.map(([,v])=>v===''?null:v);values.push(id);await pool.query(`UPDATE mantenimientos SET ${entries.map(([k],i)=>`${k}=$${i+1}`).join(',')} WHERE id=$${values.length}`,values);return this.findById(id);},
  async syncEquipo(equipoId,{estado,fechaRealizacion,proximaFecha}){await pool.query(`UPDATE equipos SET estado=$1,fecha_ultimo_mantenimiento=COALESCE($2,fecha_ultimo_mantenimiento),fecha_proximo_mantenimiento=COALESCE($3,fecha_proximo_mantenimiento) WHERE id=$4`,[estado,fechaRealizacion||null,proximaFecha||null,equipoId]);},
  async addRepuesto(mantenimientoId,repuestoId,cantidad){
    const client=await pool.connect();try{await client.query('BEGIN');const spare=await client.query('SELECT precio,cantidad_disponible FROM repuestos WHERE id=$1 AND activo=TRUE FOR UPDATE',[repuestoId]);if(!spare.rows[0]){const e=new Error('REPUESTO_NO_EXISTE');e.code='BUSINESS';throw e;}if(spare.rows[0].cantidad_disponible<cantidad){const e=new Error('STOCK_INSUFICIENTE');e.code='BUSINESS';throw e;}const precio=spare.rows[0].precio;await client.query(`INSERT INTO mantenimiento_repuestos(mantenimiento_id,repuesto_id,cantidad,precio_unitario) VALUES($1,$2,$3,$4) ON CONFLICT(mantenimiento_id,repuesto_id) DO UPDATE SET cantidad=mantenimiento_repuestos.cantidad+EXCLUDED.cantidad,precio_unitario=EXCLUDED.precio_unitario`,[mantenimientoId,repuestoId,cantidad,precio]);await client.query('UPDATE repuestos SET cantidad_disponible=cantidad_disponible-$1 WHERE id=$2',[cantidad,repuestoId]);await client.query('UPDATE mantenimientos SET costo=costo+($1*$2) WHERE id=$3',[cantidad,precio,mantenimientoId]);await client.query('COMMIT');return this.findById(mantenimientoId);}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
  },
};
module.exports={mantenimientoRepository};
