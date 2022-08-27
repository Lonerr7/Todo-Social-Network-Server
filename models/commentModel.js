const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      minLength: [3, 'Comment is too small!'],
      maxLength: [200, 'Comment is too big!'],
    },
    createdAt: {
      type: Date,
      default: Date.now() + 3 * 60 * 60 * 1000,
    },
    todo: {
      type: mongoose.Schema.ObjectId,
      ref: 'Todo',
      required: [true, 'Comment must belong to a todo.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Comment must belong to a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
