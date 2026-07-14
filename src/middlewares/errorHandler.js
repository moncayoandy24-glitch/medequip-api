const { sendError } = require('../utils/responseHelper');

const errorHandler = (err, req, res, next) => {
  sendError(err, req, res, next);
};

module.exports = { errorHandler };
