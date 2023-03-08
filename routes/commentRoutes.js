const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const {
  getAllComments,
  createComment,
  updateComment,
  setTodoId,
  getComment,
  deleteCommentIfOwner,
} = require('../controllers/commentController');
const { USER, ADMIN, CEO } = require('../utils/roles');

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .get(getAllComments)
  .post(restrictTo(USER, ADMIN, CEO), setTodoId, createComment);

router
  .route('/:id')
  .get(getComment)
  .patch(updateComment)
  .delete(protect, restrictTo(ADMIN, USER, CEO), deleteCommentIfOwner);

module.exports = router;
