const mongoose = require('mongoose');
const slugify = require('slugify');

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
  slug: String,
});

// Document middleware: runs before .save() and .create(), but NOT after insertMany()
todoSchema.pre('save', function (next) {
  this.slug = slugify(this.taskText, { lower: true });

  next();
});

const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;
