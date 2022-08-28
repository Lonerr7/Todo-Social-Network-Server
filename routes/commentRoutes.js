const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const {
  getAllComments,
  createComment,
  deleteComment,
} = require('../controllers/commentController');
const { USER } = require('../utils/roles');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getAllComments)
  .post(protect, restrictTo(USER), createComment);

router.route('/:id').delete(deleteComment);

module.exports = router;
