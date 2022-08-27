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
const { ADMIN } = require('../utils/roles');
const commentRouter = require('../routes/commentRoutes');

const router = express.Router();

// Rerouting request into comment router
router.use('/:todoId/comments', commentRouter);

router.route('/todo-stats').get(getTodoStats);

router.route('/').get(protect, getAllTodos).post(createTodo);
router
  .route('/:id')
  .get(getTodo)
  .patch(updateTodo)
  .delete(protect, restrictTo(ADMIN), deleteTodo);

module.exports = router;
