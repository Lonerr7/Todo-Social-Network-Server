const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} is ${err.value}`;

  return new AppError(message, 400);
};

const handleDuplicateFieldErrorDB = (err) => {
  const wrongValue = Object.values(err.keyValue)[0];
  const message = `The user with this value: <${wrongValue}> already exists. Please use another value!`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`.trim();

  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send a message to the client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Programming or othe unknown error: don't leak details to the client
  console.error(`ERROR💥 ${err}`, err.stack);

  res.status(500).json({
    status: 'error',
    message: 'Something went very wrong',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign(err);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldErrorDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
  }
};
