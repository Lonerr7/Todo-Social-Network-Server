const Todo = require('../models/todoModel');

exports.getAllTodos = async (req, res) => {
  try {
    // BUILD QUERY
    // 1A) FIltering
    const { page, sort, limit, fields, ...queryObj } = req.query;

    // 1B) Advanced filtering
    const replacedQueryObj = JSON.parse(
      JSON.stringify(queryObj).replace(
        /\b(gte|gt|lte|lt)\b/g,
        (matched) => `$${matched}`
      )
    );

    let query = Todo.find(replacedQueryObj);

    // 2) Sorting (dosent work anything, but numbers)
    if (sort) {
      // const sortBy = sort.replace(',', ' ');
      // query = query.sort(sort);
    } else {
      query = query.sort('_id');
    }

    // 3) Field limiting
    if (fields) {
      const selectedFields = fields.split(',').join(' ');
      console.log(selectedFields);

      query = query.select(selectedFields);
    } else {
      query = query.select('-__v');
    }

    // 4) Pagination
    const currentPage = +page || 1;
    const currentLimit = +limit || 10;
    const skip = (currentPage - 1) * currentLimit;

    query = query.skip(skip).limit(currentLimit);

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
