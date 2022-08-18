const Todo = require('../models/todoModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllTodos = catchAsync(async (req, res) => {
  // BUILD QUERY
  // 1A) FIltering
  const { page, sort, limit, fields, ...queryObj } = req.query;

  // 1B) Advanced filtering
  let query = APIFeatures.filter(queryObj, Todo);

  // 2) Sorting (dosent work anything, but numbers)
  query = APIFeatures.sort(sort, query);

  // 3) Field limiting
  query = APIFeatures.limitFields(fields, query);

  // 4) Pagination
  query = APIFeatures.paginate(page, limit, query);

  // EXECUTE QUERY
  const todos = await query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: todos.length,
    data: {
      todos,
    },
  });
});

exports.createTodo = catchAsync(async (req, res) => {
  const newTodo = await Todo.create({
    taskText: req.body.taskText,
    isCompleted: req.body.isCompleted,
    difficulty: req.body.difficulty,
    image: req.body.image,
    secretTodo: req.body.secretTodo,
  });

  res.status(201).json({
    status: 'success',
    data: {
      todo: newTodo,
    },
  });
});

exports.getTodo = catchAsync(async (req, res, next) => {
  const todo = await Todo.findById(req.params.id);

  if (!todo) {
    return next(new AppError('No todo found with that ID', 404));
  }

  res.status(201).json({
    status: 'success',
    data: {
      todo: todo,
    },
  });
});

exports.updateTodo = catchAsync(async (req, res, next) => {
  const updatedTodo = await Todo.findByIdAndUpdate(
    req.params.id,
    {
      taskText: req.body.taskText,
      isCompleted: req.body.isCompleted,
      difficulty: req.body.difficulty,
    },
    {
      new: true, // return new doc into updatedTodo variable
      runValidators: true,
    }
  );

  if (!updatedTodo) {
    return next(new AppError('No todo found with that ID', 404));
  }

  res.status(201).json({
    status: 'success',
    data: {
      todo: updatedTodo,
    },
  });
});

exports.deleteTodo = catchAsync(async (req, res, next) => {
  const deletedTodo = await Todo.findByIdAndDelete(req.params.id);

  if (!deletedTodo) {
    return next(new AppError('No todo found with that ID', 404));
  }

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
