const Comment = require('../models/commentModel');
const catchAsync = require('../utils/catchAsync');
const { deleteOne, updateOne, createOne } = require('./handlerFactory');

exports.getAllComments = catchAsync(async (req, res, next) => {
  let filter = {};

  if (req.params.todoId) {
    filter = {
      todo: req.params.todoId,
    };
  }

  const comments = await Comment.find(filter);

  res.status(200).json({
    status: 'success',
    results: comments.length,
    data: {
      comments,
    },
  });
});

exports.setTodoId = (req, res, next) => {
  if (!req.body.todo) {
    req.body.todo = req.params.todoId;
  }

  next();
};

exports.createComment = createOne(Comment);

exports.updateComment = updateOne(Comment);
exports.deleteComment = deleteOne(Comment);
