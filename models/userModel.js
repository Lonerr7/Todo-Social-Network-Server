const mongoose = require('mongoose');
const validator = require('validator');

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
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
  },
  nickname: {
    type: String,
    required: [true, 'Please enter your nickname'],
    unique: true,
    maxLength: [20, 'Nickname cannot be more than 20 characters!'],
  },
  photo: String,
});

const User = mongoose.model('User', userSchema);

module.exports = User;