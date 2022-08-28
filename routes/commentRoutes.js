const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const {
  getAllComments,
  createComment,
  deleteComment,
  updateComment,
  setTodoId,
  getComment,
} = require('../controllers/commentController');
const { USER, ADMIN } = require('../utils/roles');

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .get(getAllComments)
  .post(restrictTo(USER), setTodoId, createComment);

// !
router
  .route('/:id')
  .get(getComment)
  .patch(updateComment)
  .delete(protect, restrictTo(ADMIN, USER), deleteComment);

module.exports = router;
