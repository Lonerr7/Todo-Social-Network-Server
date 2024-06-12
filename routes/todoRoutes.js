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
const { ADMIN_ROLE, CEO_ROLE, USER_ROLE } = require('../utils/roles');
const commentRouter = require('../routes/commentRoutes');

const router = express.Router();

// Rerouting request into comment router
router.use('/:todoId/comments', commentRouter);

router
  .route('/todo-stats')
  .get(protect, restrictTo(ADMIN_ROLE, CEO_ROLE), getTodoStats);

router.use(protect);

router.route('/').get(getAllTodos).post(createTodo).delete(deleteAllUserTodos);
router
  .route('/:id')
  .get(getTodo)
  .patch(updateTodo)
  .delete(restrictTo(ADMIN_ROLE, USER_ROLE, CEO_ROLE), deleteTodo);

router.route('/:id/owner').get(getTodoOwner);

module.exports = router;
