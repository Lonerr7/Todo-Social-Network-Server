const Todo = require('../models/todoModel');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllTodos = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createTodo = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTodo = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    res.status(201).json({
      status: 'success',
      data: {
        todo: todo,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTodo = async (req, res) => {
  try {
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

    res.status(201).json({
      status: 'success',
      data: {
        todo: updatedTodo,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

// Aggregation pipeline
exports.getTodoStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
