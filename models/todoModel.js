const mongoose = require('mongoose');
const slugify = require('slugify');

const todoSchema = new mongoose.Schema(
  {
    taskText: {
      type: String,
      required: [true, 'Please enter a task'],
      trim: true,
      maxLength: [40, 'A task must not be more than 40 characters'],
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
    secretTodo: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate
todoSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'todo',
  localField: '_id',
});

// Document middleware: runs before .save() and .create(), but NOT after insertMany()
todoSchema.pre('save', function (next) {
  this.slug = slugify(this.taskText, { lower: true });

  next();
});

// Query middleware
todoSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ secretTodo: { $ne: true } });

  next();
});

// Aggregation middleware
todoSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTodo: { $ne: true } } });

  next();
});

const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;
