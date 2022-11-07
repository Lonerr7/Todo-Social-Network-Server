const ChatUser = require('../models/chatUserModel');
const { createOne, getAll, deleteOne } = require('./handlerFactory');

exports.getAllChatUsers = getAll(ChatUser);
// exports.createChatUser = createOne(ChatUser);
// exports.deleteCurrentUser = deleteOne(ChatUser);
