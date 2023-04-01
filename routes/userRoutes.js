const express = require('express');
const { CEO_ROLE } = require('../utils/roles');

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
  changeUserRole,
  banOrUnbanUser,
} = require('../controllers/userController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword', resetPassword);

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
  .patch(restrictTo(CEO_ROLE), updateUser)
  .delete(restrictTo(CEO_ROLE), deleteUser);

router.patch('/changeUserRole/:id', changeUserRole);
router.patch('/banOrUnbanUser/:id', banOrUnbanUser);

module.exports = router;
