const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const {
  getAllTodos,
  createTodo,
  getTodo,
  updateTodo,
  deleteTodo,
  getTodoStats,
} = require('../controllers/todoController');
const { createComment } = require('../controllers/commentController');
const { ADMIN, USER } = require('../utils/roles');

const router = express.Router();

router.route('/todo-stats').get(getTodoStats);

router.route('/').get(protect, getAllTodos).post(createTodo);
router
  .route('/:id')
  .get(getTodo)
  .patch(updateTodo)
  .delete(protect, restrictTo(ADMIN), deleteTodo);

router
  .route('/:todoId/comments')
  .post(protect, restrictTo(USER), createComment);

module.exports = router;
