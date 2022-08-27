const express = require('express');
const morgan = require('morgan');
const todoRouter = require('./routes/todoRoutes');
const userRouter = require('./routes/userRoutes');
const commentRouter = require('./routes/commentRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

//* =================== Creating an express app ===================

const app = express();

//* =================== Global Middlewares ===================

// Setting security HTTP headers
app.use(helmet());

// Getting info about requests
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting numbers of requests
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP! Try again in 1 hour!',
});
app.use('/api', limiter);

// Body parser. Reading data from body into req.body
app.use(
  express.json({
    limit: '30kb',
  })
);

// Data sanitization against NoSQL query injections
app.use(mongoSanitize());

// Data sanitization agains XSS
app.use(xss());

// Preventing parameter pollution
app.use(
  hpp({
    whitelist: ['difficulty'],
  })
);

//* =================== Routing ===================

app.use('/api/v1/todos', todoRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/comments', commentRouter);

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
