const Comment = require('../models/commentModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { updateOne, getOne, getAll, deleteOne } = require('./handlerFactory');

exports.getAllComments = getAll(Comment);

exports.setTodoId = (req, res, next) => {
  if (!req.body.todo) {
    req.body.todo = req.params.todoId;
  }

  next();
};

exports.deleteCommentIfOwner = catchAsync(async (req, res, next) => {
  // 1) Find and delete the doc if user owns it
  const doc = await Comment.findById(req.params.id);

  if (req.user.id === doc.user.id) {
    await doc.delete();
  } else {
    return next(new AppError('Wrong user'));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createComment = catchAsync(async (req, res, next) => {
  req.body.user = req.user.id;

  const newDoc = await (
    await Comment.create(req.body)
  ).populate('user', 'id nickname photo');

  res.status(201).json({
    status: 'success',
    data: {
      data: newDoc,
    },
  });
});

exports.getComment = getOne(Comment);
// exports.createComment = createOne(Comment);
exports.updateComment = updateOne(Comment);
exports.deleteComment = deleteOne(Comment);
