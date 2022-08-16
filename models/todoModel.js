const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  taskText: {
    type: String,
    required: [true, 'Please enter a task'],
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy',
    trim: true,
    lowercase: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  image: String,
  createdAt: {
    type: Date,
    default: Date.now() + 3 * 60 * 60 * 1000,
  },
});

const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;
