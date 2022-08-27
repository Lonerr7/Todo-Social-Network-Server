const Comment = require('../models/commentModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllComments = catchAsync(async (req, res, next) => {
  const comments = await Comment.find();

  res.status(200).json({
    status: 'success',
    results: comments.length,
    data: {
      comments,
    },
  });
});

exports.createComment = catchAsync(async (req, res, next) => {
  // Allow nested routes
  if (!req.body.todo) {
    req.body.todo = req.params.todoId;
  }

  const newComment = await Comment.create({
    comment: req.body.comment,
    user: req.user._id,
    todo: req.body.todo,
  });

  res.status(201).json({
    status: 'success',
    data: {
      comment: newComment,
    },
  });
});
