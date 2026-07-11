const { validationResult } = require('express-validator');
const { AppError } = require('../utils/appError');

const validate = (validaciones) => {
  return async (req, res, next) => {
    await Promise.all(validaciones.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const mensajes = errors.array().map((err) => err.msg);
    throw new AppError(mensajes.join(', '), 400);
  };
};

module.exports = { validate };
