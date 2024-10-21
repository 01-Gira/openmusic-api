const errorHandler = (error, h) => {
  if (error.isJoi) {
    return h.response({
      status: 'fail',
      message: error.details[0].message,
    }).code(400);
  }

  return h.response({
    status: 'error',
    message: 'Internal Server Error',
  }).code(500);
};

module.exports = errorHandler;