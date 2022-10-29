const multer = require('multer');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { deleteOne, updateOne, getOne, getAll } = require('./handlerFactory');

// === Multer ===
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});

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
// ================

exports.getAllUsers = getAll(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file);
  // console.log(req.body);

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
  } = req.body;
  const fieldsToUpdate = {
    nickname,
    email,
    bio,
    photo: req.file.originalName,
    firstName,
    lastName,
    generalInfo,
    mainInfo,
    contactInfo,
    beliefs,
    personalInfo,
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
