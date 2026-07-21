const pool = require('../config/database');
const { auditoriaRepository } = require('../repositories/auditoriaRepository');

const actionByMethod = { POST: 'creacion', PUT: 'actualizacion', PATCH: 'cambio_estado', DELETE: 'desactivacion' };
const tables = { usuarios:'usuarios',roles:'roles',equipos:'equipos',categorias:'categorias_equipos',ubicaciones:'ubicaciones',proveedores:'proveedores',repuestos:'repuestos',mantenimientos:'mantenimientos',calibraciones:'calibraciones',fallas:'reportes_fallas',movimientos:'movimientos_equipos' };
const protect = (value) => {
  if (!value || typeof value !== 'object') return value;
  const copy = Array.isArray(value) ? [...value] : { ...value };
  for (const field of ['password', 'passwordActual', 'passwordNueva', 'password_hash', 'token']) if (field in copy) copy[field] = '[PROTEGIDO]';
  return copy;
};

const audit = (modulo) => async (req, res, next) => {
  if (!actionByMethod[req.method]) return next();
  const match = req.originalUrl.match(/[0-9a-f]{8}-[0-9a-f-]{27,}/i);
  const requestedId = match?.[0] || null;
  let previous = null;
  try {
    if (requestedId && tables[modulo]) {
      const result = await pool.query(`SELECT to_jsonb(t) data FROM ${tables[modulo]} t WHERE id=$1`, [requestedId]);
      previous = protect(result.rows[0]?.data || null);
    }
  } catch (error) {
    return next(error);
  }

  let responseData;
  const originalJson = res.json.bind(res);
  res.json = (payload) => { responseData = payload?.data; return originalJson(payload); };
  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 400 && req.user) {
      const data = protect(responseData || req.body);
      auditoriaRepository.create({
        usuario_id: req.user.id,
        accion: actionByMethod[req.method],
        modulo,
        registro_id: requestedId || data?.id || null,
        datos_anteriores: previous,
        datos_nuevos: data,
        ip: req.ip,
      }).catch((error) => console.error('No se pudo registrar auditoría:', error.message));
    }
  });
  return next();
};

module.exports = { audit };
