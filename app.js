const express = require('express');
const morgan = require('morgan');
const todoRouter = require('./routes/todoRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

//* =================== Creating an express app ===================

const app = express();

//* =================== Middlewares ===================

// Getting info about requests
app.use(morgan('dev'));

// Reading json from requests if we are in development environment
if (process.env.NODE_ENV === 'development') app.use(express.json());

//* =================== Routing ===================

// Users

app.use('/api/v1/todos', todoRouter);
app.use('/api/v1/users', userRouter);

// Handling wrong routes
app.all('*', (req, res, next) => {
  const err = new AppError(
    `Can't find ${req.originalUrl} on this server!`,
    404
  );

  next(err);
});

//* =================== Global error handling middleware ===================
app.use(globalErrorHandler);

//* =================== Starting a server ===================

// exporting a server to start in server.js file
module.exports = app;
