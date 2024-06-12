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
const { USER_ROLE, ADMIN_ROLE, CEO_ROLE } = require('../utils/roles');

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .get(getAllComments)
  .post(restrictTo(USER_ROLE, ADMIN_ROLE, CEO_ROLE), setTodoId, createComment);

router
  .route('/:id')
  .get(getComment)
  .patch(updateComment)
  .delete(
    protect,
    restrictTo(ADMIN_ROLE, USER_ROLE, CEO_ROLE),
    deleteCommentIfOwner
  );

module.exports = router;
