const express = require('express');

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
} = require('../controllers/authController');
const {
  getAllUsers,
  deleteUser,
  updateMe,
  deleteMe,
  getUser,
  updateUser,
  getMe,
  uploadUserPhoto,
  changeMyAvatar,
  processUserPhoto,
} = require('../controllers/userController');
const { ADMIN } = require('../utils/roles');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/', resetPassword);

// Protecting all routes after router.use(protect), because router is a mini-app which is capable of using middlewares.
router.use(protect);

router.patch('/updateMyPassword', updatePassword);
router.get('/me', getMe, getUser);
router.patch('/updateMe', uploadUserPhoto, updateMe);
router.patch(
  '/updateMyAvatar',
  uploadUserPhoto,
  processUserPhoto,
  changeMyAvatar
);
router.delete('/deleteMe', deleteMe);

router.route('/').get(getAllUsers);
router
  .route('/:id')
  .get(getUser)
  .patch(restrictTo(ADMIN), updateUser)
  .delete(restrictTo(ADMIN), deleteUser);

module.exports = router;
