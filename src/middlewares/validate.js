const { validationResult } = require('express-validator');
const { AppError } = require('../utils/appError');

const validate = (validaciones) => {
  return async (req, res, next) => {
    await Promise.all(validaciones.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const detalles = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    const error = new AppError('Error de validación', 422);
    error.errors = detalles;
    throw error;
  };
};

module.exports = { validate };
