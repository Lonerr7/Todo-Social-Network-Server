const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const ChatMessage = require('../models/chatMessageModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { deleteOne, updateOne, getOne, getAll } = require('./handlerFactory');

// === Multer ===
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users/avatars');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image. Please, upload only images', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.processUserPhoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}.jpeg`;

  sharp(req.file.buffer)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/avatars/${req.file.filename}`);

  next();
};
// ================

exports.getAllUsers = getAll(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) If user tries to update a password create an Error
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates! Please use /updateMyPassword',
        400
      )
    );
  }

  // 2) Update user document
  const {
    nickname,
    email,
    bio,
    firstName,
    lastName,
    generalInfo,
    mainInfo,
    contactInfo,
    beliefs,
    personalInfo,
    onlineStatus,
  } = req.body;
  const fieldsToUpdate = {
    nickname,
    email,
    bio,
    photo:
      req.file?.filename &&
      `http://localhost:8000/public/img/users/avatars/${req.file.filename}`,
    firstName,
    lastName,
    generalInfo,
    mainInfo,
    contactInfo,
    beliefs,
    personalInfo,
    onlineStatus,
  };

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.changeMyAvatar = catchAsync(async (req, res, next) => {
  const photo = req.file.filename;

  const user = await User.findByIdAndUpdate(req.user._id, {
    photo: `http://localhost:8000/public/img/users/avatars/${photo}`,
  });

  res.status(200).json({
    status: 'success',
    data: {
      photo: user.photo,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  // 1) Get user based on ID
  const user = await User.findById(req.user._id)
    .select('+password')
    .select('+passwordConfirm');

  // 2) If no user found || password (and passwordConfirm) is incorrect send an error
  const isPasswordCorrect = await user.correctPassword(
    req.body.password,
    user.password
  );

  const isPasswordConfirmCorrect = await user.correctPassword(
    req.body.passwordConfirm,
    user.passwordConfirm
  );

  if (!user || !isPasswordCorrect || !isPasswordConfirmCorrect) {
    return next(
      new AppError(
        'The user not found or password is incorrect! Try again',
        404
      )
    );
  }

  // 3) Delete the user
  await user.deleteOne();

  // Delete all user messages
  await ChatMessage.deleteMany({ userId: user.id });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// FOR ADMINS (Do NOT update passwords with this)
exports.getUser = getOne(User, { path: 'todos', select: '-secretTodo -id' });
exports.updateUser = updateOne(User);
exports.deleteUser = deleteOne(User);

//* Middleware functions
