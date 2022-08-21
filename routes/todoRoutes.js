const express = require('express');
const { protect } = require('../controllers/authController');
const {
  getAllTodos,
  createTodo,
  getTodo,
  updateTodo,
  deleteTodo,
  getTodoStats,
} = require('../controllers/todoController');

const router = express.Router();

router.route('/todo-stats').get(getTodoStats);

router.route('/').get(protect, getAllTodos).post(createTodo);
router.route('/:id').get(getTodo).patch(updateTodo).delete(deleteTodo);

module.exports = router;
