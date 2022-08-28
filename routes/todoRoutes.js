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
const { ADMIN, USER } = require('../utils/roles');
const commentRouter = require('../routes/commentRoutes');

const router = express.Router();

// Rerouting request into comment router
router.use('/:todoId/comments', commentRouter);

router.route('/todo-stats').get(protect, restrictTo(ADMIN), getTodoStats);

router.route('/').get(protect, getAllTodos).post(protect, createTodo);
router
  .route('/:id')
  .get(getTodo)
  .patch(protect, updateTodo)
  .delete(protect, restrictTo(ADMIN, USER), deleteTodo);

module.exports = router;
