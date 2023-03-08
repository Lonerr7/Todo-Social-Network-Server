const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const {
  getAllTodos,
  createTodo,
  getTodo,
  updateTodo,
  deleteTodo,
  getTodoStats,
  deleteAllUserTodos,
  getTodoOwner,
} = require('../controllers/todoController');
const { ADMIN, USER, CEO } = require('../utils/roles');
const commentRouter = require('../routes/commentRoutes');

const router = express.Router();

// Rerouting request into comment router
router.use('/:todoId/comments', commentRouter);

router.route('/todo-stats').get(protect, restrictTo(ADMIN, CEO), getTodoStats);

router.use(protect);

router.route('/').get(getAllTodos).post(createTodo).delete(deleteAllUserTodos);
router
  .route('/:id')
  .get(getTodo)
  .patch(updateTodo)
  .delete(restrictTo(ADMIN, USER, CEO), deleteTodo);

router.route('/:id/owner').get(getTodoOwner);

module.exports = router;
