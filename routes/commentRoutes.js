const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const {
  getAllComments,
  createComment,
  deleteComment,
  updateComment,
  setTodoId,
} = require('../controllers/commentController');
const { USER } = require('../utils/roles');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getAllComments)
  .post(protect, restrictTo(USER), setTodoId, createComment);

router.route('/:id').patch(updateComment).delete(deleteComment);

module.exports = router;
