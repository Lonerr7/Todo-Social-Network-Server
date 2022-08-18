const express = require('express');
const morgan = require('morgan');
const todoRouter = require('./routes/todoRoutes');
const userRouter = require('./routes/userRoutes');

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
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

//* =================== Starting a server ===================

// exporting a server to start in server.js file
module.exports = app;
