const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  taskText: {
    type: String,
    required: [true, 'Please provide a task'],
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;
