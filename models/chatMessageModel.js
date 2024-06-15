const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  text: {
    type: String,
    required: true,
    min: [1, 'Please, enter your message'],
    max: [500, 'Your message is too long'],
  },
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;
