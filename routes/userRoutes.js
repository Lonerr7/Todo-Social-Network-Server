const express = require('express');
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  checkBody,
} = require('../controllers/userController');

const router = express.Router();

router.route('/').get(getAllUsers).post(checkBody, createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
