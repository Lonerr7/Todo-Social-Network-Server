const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please enter your login'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email'],
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
  },
  passwordChangedAt: Date,
  nickname: {
    type: String,
    required: [true, 'Please enter your nickname'],
    unique: true,
    maxLength: [20, 'Nickname cannot be more than 20 characters!'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
});

// Encrypting a password (runs between the data is got from req.body and is saved to DB)
userSchema.pre('save', async function (next) {
  // Only run if password was modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // Delete passwordConfirm field from DB (not persisting it)
  this.passwordConfirm = undefined;
  next();
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

  // False = not changed
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
