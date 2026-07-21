const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  if (err.code === '23505') {
    statusCode = 409;
    message = 'Ya existe un registro con uno de los valores enviados';
  } else if (err.code === '23503') {
    statusCode = 409;
    message = 'La operación viola una relación entre registros';
  } else if (err.code === '23502' || err.code === '22P02') {
    statusCode = 400;
    message = 'Los datos enviados no son válidos';
  }

  if (statusCode >= 500) console.error(`[${new Date().toISOString()}]`, err);

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
