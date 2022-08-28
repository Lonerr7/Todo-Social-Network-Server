const Todo = require('../models/todoModel');
const catchAsync = require('../utils/catchAsync');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./handlerFactory');

exports.getAllTodos = getAll(Todo);
exports.getTodo = getOne(Todo, { path: 'comments' });
exports.createTodo = createOne(Todo);
exports.updateTodo = updateOne(Todo);
exports.deleteTodo = deleteOne(Todo);

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
