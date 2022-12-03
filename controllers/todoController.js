const Todo = require('../models/todoModel');
const Comment = require('../models/commentModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { updateOne, createOne, getOne, getAll } = require('./handlerFactory');

exports.getAllTodos = getAll(Todo);
exports.getTodo = getOne(Todo, { path: 'comments' });
exports.createTodo = createOne(Todo);
exports.updateTodo = updateOne(Todo);

exports.deleteTodo = catchAsync(async (req, res, next) => {
  const deletedDoc = await Todo.findByIdAndDelete(req.params.id);

  if (!deletedDoc) {
    return next(new AppError('No document found with that ID', 404));
  }

  await Comment.deleteMany({ todo: req.params.id });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Aggregation pipeline
exports.getTodoStats = catchAsync(async (req, res) => {
  const stats = await Todo.aggregate([
    {
      $match: { isCompleted: { $eq: false } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTodos: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.deleteAllUserTodos = catchAsync(async (req, res, next) => {
  const deletedDocs = await Todo.deleteMany({ user: req.user.id });

  res.status(204).json({
    status: 'success',
    data: deletedDocs,
  });
});
