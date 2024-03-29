const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { USER, ADMIN, CEO } = require('../utils/roles');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please enter your login'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please enter a valid email'],
    },
    firstName: {
      type: String,
      maxLength: [20, 'First name cannot be more than 20 characters'],
    },
    lastName: {
      type: String,
      maxLength: [20, 'Last name cannot be more than 20 characters'],
    },
    bio: {
      type: String,
      maxLength: [100, 'Bio cannot be more, than 100 characters'],
    },
    password: {
      type: String,
      required: [true, 'Please enter your password'],
      minLength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'], // means it is a required input, NOT required to be persisted in DB
      validate: {
        // ONLY WORKS ON CREATE AND SAVE!!!
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords are not the same!',
      },
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    nickname: {
      type: String,
      required: [true, 'Please enter your nickname'],
      unique: true,
      maxLength: [20, 'Nickname cannot be more than 20 characters!'],
      minLength: [3, 'Nickname is too short!'],
    },
    photo: String,
    photoPublicId: String,
    generalInfo: {
      dateOfBirth: Date,
      currentCity: String,
      country: String,
      relationship: {
        type: String,
        enum: ['Married', 'Not married', 'In active search', 'Single', ''],
      },
      website: String,
      jobPlace: String,
    },
    mainInfo: {
      cityOfBirth: String,
      nativeLanguage: String,
    },
    contactInfo: {
      phoneNumber: String,
      discord: {
        type: String,
        max: [30, 'Your discord is too long!'],
      },
    },
    beliefs: {
      politicalViews: String,
      religion: {
        type: String,
        enum: ['Orthodoxy', 'Catholicism', 'Islam', 'Buddhism', 'Judaism', ''],
        default: '',
      },
      inspiredBy: {
        type: String,
        max: [100, 'Too much!'],
      },
    },
    personalInfo: {
      activities: {
        type: String,
        max: [40, 'Too much!'],
      },
      interests: {
        type: String,
        max: [40, 'Too much!'],
      },
      attitudeTowardsSmoking: {
        type: String,
        enum: ['Positive', 'Neutral', 'Negative', 'Compromise', ''],
        default: '',
      },
      attitudeTowardsDrinking: {
        type: String,
        enum: ['Positive', 'Neutral', 'Negative', 'Compromise', ''],
        default: '',
      },
      favoriteMusic: {
        type: String,
        max: [40, 'Too much!'],
      },
      favoriteMovies: {
        type: String,
        max: [40, 'Too much!'],
      },
      favouriteBooks: {
        type: String,
        max: [40, 'Too much!'],
      },
      aboutMe: {
        type: String,
        max: [40, 'Too much!'],
      },
    },
    role: {
      type: String,
      enum: [USER, ADMIN, CEO],
      default: USER,
    },
    isVerified: Boolean,
    todo: {
      type: mongoose.Schema.ObjectId,
      ref: 'Todo',
    },
    onlineStatus: {
      type: String,
      enum: ['Online', 'Offline', "Don't bother", 'Away', 'Sleeping'],
      default: 'Online',
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtual populate
userSchema.virtual('todos', {
  ref: 'Todo',
  foreignField: 'user',
  localField: '_id',
});

//* Middlewares

// Encrypting a password (runs between the data is got from req.body and is saved to DB)
userSchema.pre('save', async function (next) {
  // Only run if password was modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = await bcrypt.hash(this.passwordConfirm, 12);

  // // Delete passwordConfirm field from DB (not persisting it)
  // this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }

  this.passwordChangedAt = Date.now();

  next();
});

// deleting all user's references
userSchema.pre('remove', function (next) {
  // this.
});

//* Instance methods
// Comparing encrypted password with entered password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Checking if user has changed his password
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  // In instance methods <this> points to the current document
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // false = not changed
  return false;
};

// Generating password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 3 * 63 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
