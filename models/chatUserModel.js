const mongoose = require('mongoose');

const chatUserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    maxLength: [20, 'First name cannot be more than 20 characters'],
  },
  lastName: {
    type: String,
    maxLength: [20, 'Last name cannot be more than 20 characters'],
  },
  nickname: {
    type: String,
    required: [true, 'Please enter your nickname'],
    unique: true,
    maxLength: [20, 'Nickname cannot be more than 20 characters!'],
    minLength: [3, 'Nickname is too short!'],
  },
  photo: {
    type: String,
    default: 'http://localhost:8000/public/img/users/default.jpg', //!
  },
});

const ChatUser = mongoose.model('ChatUser', chatUserSchema);

module.exports = ChatUser;