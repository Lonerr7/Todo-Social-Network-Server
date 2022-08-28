const Comment = require('../models/commentModel');
const {
  updateOne,
  createOne,
  getOne,
  getAll,
  deleteOne,
} = require('./handlerFactory');

exports.getAllComments = getAll(Comment);

exports.setTodoId = (req, res, next) => {
  if (!req.body.todo) {
    req.body.todo = req.params.todoId;
  }

  next();
};

exports.getComment = getOne(Comment);
exports.createComment = createOne(Comment);
exports.updateComment = updateOne(Comment);
exports.deleteComment = deleteOne(Comment);
