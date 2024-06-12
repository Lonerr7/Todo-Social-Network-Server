const cloudinary = require('cloudinary').v2;
const User = require('../models/userModel');
const Todo = require('../models/todoModel');
const ChatMessage = require('../models/chatMessageModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { updateOne, getOne, getAll } = require('./handlerFactory');
const { manipulateUserIfAdmin } = require('../utils/manipulateUserIfAdmin');
const deleteUserAndAllUserInfo = require('../utils/deleteUserAndAllUserInfo');

// === Cloudinary ===
cloudinary.config({
  cloud_name: 'dpjxab8bq',
  secure: true,
  api_key: '449623978235478',
  api_secret: 'fSF__DdDnB-NNgMuEkH-O-Zcmr4',
});

const uploadOptions = {
  overwrite: true,
  invalidate: true,
  resource_type: 'auto',
};

const uploadImage = async (img, userId) => {
  try {
    const user = await User.findById(userId);

    if (user.photoPublicId) {
      uploadOptions.public_id = user.photoPublicId;
    }

    const result = await cloudinary.uploader.upload(img, uploadOptions);

    if (!user.photoPublicId) {
      user.photoPublicId = result.public_id;
      await user.save();
    }

    return result;
  } catch (error) {
    return error.message;
  }
};

exports.uploadUserPhoto = catchAsync(async (req, res, next) => {
  const response = await uploadImage(req.body.img, req.user._id);

  if (response.message) {
    return next(new AppError(response.message, 409));
  }

  req.userPhoto = response;
  next();
});

exports.changeMyAvatar = catchAsync(async (req, res) => {
  const photo = req.userPhoto;
  console.log(photo);

  await User.findByIdAndUpdate(req.user._id, {
    photo: photo.secure_url,
  });

  res.status(200).json({
    status: 'success',
    data: {
      photo: photo.secure_url,
    },
  });
});

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

  // 3) deleting user and all his info
  await deleteUserAndAllUserInfo(user, ChatMessage, Todo);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// FOR CEOS (Do NOT update passwords with this)
exports.getUser = getOne(User, { path: 'todos', select: '-secretTodo -id' });
exports.updateUser = updateOne(User);
exports.deleteUser = catchAsync(async (req, res, next) => {
  // 1) Getting user Doc
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No document found with that ID', 404));
  }

  await deleteUserAndAllUserInfo(user, ChatMessage, Todo);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.changeUserRole = catchAsync(async (req, res, next) => {
  // 1) Getting all neccesary parameters
  const { id: myId } = req.user;
  const { id: userId } = req.params;

  const { roleToGive } = req.body;

  // Checking if role exists: if so, then checking if it is correct
  if (!roleToGive) {
    return next(
      new AppError('Invalid action or improper role. Please try again!', 400)
    );
  }

  // 1.2 Finding a user whoose role we want to upgrade / lower and checking if he exists
  const user = await User.findById(userId);

  // if no user was found return an error
  if (!user) {
    return next(
      new AppError('The user you are looking for was not found', 404)
    );
  }

  // 2) Findning an admin
  const admin = await User.findById(myId);

  // If user is not an admin OR if user is an admin and he wants to downgrade another admin's role return an error
  if (
    admin.role === 'user' ||
    (admin.role === 'admin' && user.role === 'admin')
  ) {
    return next(
      new AppError(
        `You don't have permission to perform this action / Forbidden`,
        403
      )
    );
  }

  // 3) Giving role if it is correct
  if (roleToGive === 'admin' || roleToGive === 'user') {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        role: roleToGive,
      },
      {
        new: true,
      }
    ).populate('todos');

    return res.status(201).json({
      status: 'success',
      user: updatedUser,
    });
  }

  // If role is incorrect => return an error
  return next(
    new AppError('Role is incorrect! Check entered role and try again.', 400)
  );
});

exports.banOrUnbanUser = catchAsync(async (req, res, next) => {
  // 1) Getting all neccesary parameters
  const { id: userId } = req.user;
  const { id } = req.params;

  // 1.2 Finding a user whoose role we want to upgrade / lower and checking if he exists
  const user = await User.findById(id);

  // if no user was found
  if (!user) {
    return next(
      new AppError('The user you are looking for was not found', 404)
    );
  }

  // 2) Findning an admin
  const admin = await User.findById(userId);

  // If user is not an admin return an error
  if (!(await manipulateUserIfAdmin(User, req, res, next, admin, user))) {
    return next(
      new AppError(
        `You don't have permission to perform this action / Forbidden`,
        403
      )
    );
  }
});
