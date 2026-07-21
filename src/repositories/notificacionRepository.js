const pool=require('../config/database');
const {Notificacion}=require('../entities/Notificacion');
const notificacionRepository={
 async create({usuario_id,tipo,titulo,mensaje,referencia_id}){const r=await pool.query('INSERT INTO notificaciones(usuario_id,tipo,titulo,mensaje,referencia_id) VALUES($1,$2,$3,$4,$5) RETURNING *',[usuario_id||null,tipo,titulo,mensaje,referencia_id||null]);return Notificacion.fromRow(r.rows[0])},
 async createForRoles(roles,data){await pool.query(`INSERT INTO notificaciones(usuario_id,tipo,titulo,mensaje,referencia_id) SELECT DISTINCT u.id,$1,$2,$3,$4 FROM usuarios u JOIN usuario_roles ur ON ur.usuario_id=u.id JOIN roles r ON r.id=ur.rol_id WHERE u.activo=TRUE AND r.activo=TRUE AND r.nombre=ANY($5::text[])`,[data.tipo,data.titulo,data.mensaje,data.referencia_id||null,roles])},
 async findByUser(userId,{page=1,limit=20,leida}={}){const vals=[userId],conds=['usuario_id=$1'];if(leida!==undefined){vals.push(leida);conds.push(`leida=$${vals.length}`)}const where=`WHERE ${conds.join(' AND ')}`;const count=await pool.query(`SELECT COUNT(*) FROM notificaciones ${where}`,vals);vals.push(limit,(page-1)*limit);const r=await pool.query(`SELECT * FROM notificaciones ${where} ORDER BY created_at DESC LIMIT $${vals.length-1} OFFSET $${vals.length}`,vals);return{rows:Notificacion.fromRows(r.rows),total:Number(count.rows[0].count)}},
 async markRead(id,userId){const r=await pool.query('UPDATE notificaciones SET leida=TRUE WHERE id=$1 AND usuario_id=$2 RETURNING *',[id,userId]);return Notificacion.fromRow(r.rows[0])},
 async generateAlerts(){
  const roles=['admin','ingeniero_biomedico','tecnico'];
  const alerts=[
   ['mantenimiento_proximo','Mantenimiento próximo',`SELECT m.id,concat('Mantenimiento próximo para ',e.nombre) mensaje FROM mantenimientos m JOIN equipos e ON e.id=m.equipo_id WHERE m.estado IN ('programado','pendiente') AND m.fecha_programada BETWEEN CURRENT_DATE AND CURRENT_DATE+7`],
   ['mantenimiento_vencido','Mantenimiento vencido',`SELECT m.id,concat('Mantenimiento vencido para ',e.nombre) mensaje FROM mantenimientos m JOIN equipos e ON e.id=m.equipo_id WHERE m.estado IN ('programado','pendiente') AND m.fecha_programada<CURRENT_DATE`],
   ['calibracion_proxima','Calibración próxima',`SELECT c.id,concat('Calibración próxima para ',e.nombre) mensaje FROM calibraciones c JOIN equipos e ON e.id=c.equipo_id WHERE c.estado='vigente' AND c.proxima_fecha BETWEEN CURRENT_DATE AND CURRENT_DATE+30`],
   ['calibracion_vencida','Calibración vencida',`SELECT c.id,concat('Calibración vencida para ',e.nombre) mensaje FROM calibraciones c JOIN equipos e ON e.id=c.equipo_id WHERE c.proxima_fecha<CURRENT_DATE AND c.estado<>'cancelada'`],
   ['repuesto_bajo_stock','Repuesto con bajo stock',`SELECT r.id,concat(r.nombre,' alcanzó el stock mínimo') mensaje FROM repuestos r WHERE r.activo=TRUE AND r.cantidad_disponible<=r.stock_minimo`],
   ['prestamo_vencido','Préstamo vencido',`SELECT m.id,concat('Préstamo vencido de ',e.nombre) mensaje FROM movimientos_equipos m JOIN equipos e ON e.id=m.equipo_id WHERE m.tipo='prestamo' AND m.estado='activo' AND m.fecha_prevista_devolucion<NOW()`],
   ['equipo_fuera_servicio','Equipo fuera de servicio',`SELECT e.id,concat(e.nombre,' está fuera de servicio') mensaje FROM equipos e WHERE e.activo=TRUE AND e.estado='fuera_de_servicio'`],
  ];
  for(const [tipo,titulo,source] of alerts){await pool.query(`INSERT INTO notificaciones(usuario_id,tipo,titulo,mensaje,referencia_id) SELECT DISTINCT u.id,$1,$2,a.mensaje,a.id FROM (${source}) a CROSS JOIN usuarios u JOIN usuario_roles ur ON ur.usuario_id=u.id JOIN roles ro ON ro.id=ur.rol_id WHERE u.activo=TRUE AND ro.nombre=ANY($3::text[]) AND NOT EXISTS(SELECT 1 FROM notificaciones n WHERE n.usuario_id=u.id AND n.tipo=$1 AND n.referencia_id=a.id)`,[tipo,titulo,roles])}
 },
};module.exports={notificacionRepository};
