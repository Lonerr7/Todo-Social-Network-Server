const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const {
  getAllComments,
  createComment,
} = require('../controllers/commentController');

const router = express.Router();

router
  .route('/')
  .get(getAllComments)
  .post(protect, restrictTo('user', 'admin'), createComment);

module.exports = router;
