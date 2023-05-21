const ChatUser = require('../models/chatUserModel');
const { getAll } = require('./handlerFactory');

exports.getAllChatUsers = getAll(ChatUser);
