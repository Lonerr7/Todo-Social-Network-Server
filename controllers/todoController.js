const Todo = require('../models/todoModel');

exports.getAllTodos = async (req, res) => {
  try {
    const todos = await Todo.find();

    res.status(500).json({
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
