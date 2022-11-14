const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const app = require('./app');
const socketio = require('socket.io');
const User = require('./models/userModel');
const { userJoin, userDisconnect } = require('./utils/chatUsers');
const ChatMessage = require('./models/chatMessageModel');

// Creating chat users array
let chatUsers = [];

const server = http.createServer(app);
const io = socketio(server, {
  origin: 'http://localhost:3000',
  credentials: true,
});

// Handling uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 SHUTTING DOWN...');
  console.log(err);
  process.exit(1);
});

// ===
dotenv.config({ path: './config.env' });

// Connecting to the DB
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD);
mongoose.connect(DB).then(() => console.log(`DB CONNECTION SUCCESSFUL`));

// === CHAT LOGIC WITH SOCKET.IO ===
io.on('connection', async (socket) => {
  // Logic when user joins chat
  socket.on('joinChat', async ({ userId }) => {
    const userFromDB = await User.findById(userId);
    const chatMessages = await ChatMessage.find();

    // Guard clause
    if (!userFromDB) return;

    // Push new user to chatUsers and return it from this function
    userJoin(userFromDB, socket.id, chatUsers);

    // Send an array of updated joined users to all chat users every time a new user is joined
    io.emit('userJoined', chatUsers);

    // Send an array of chat messages to newly joined user
    socket.emit('getChatMessages', chatMessages);
  });

  // Listen for chatMessages
  socket.on('chatMessage', async (message) => {
    const user = await User.findById(message.userId);

    if (!user) {
      return;
    }

    const newMessage = await ChatMessage.create({
      userId: user._id.toString(),
      nickname: user.nickname,
      avatar: user.photo,
      text: message.text,
    });

    io.emit('message', newMessage);
  });

  // Delete user message
  socket.on('deleteMessage', async ({ userId, messageId }) => {
    const deletedMessage = await ChatMessage.findOneAndDelete({
      userId,
      _id: messageId,
    });

    // send error message when we don't have a message to delete
    console.log(deletedMessage);

    const messages = await ChatMessage.find();

    io.emit('messageDeleted', messages);
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    // Getting current disconnected user and updated array of connected users
    const [disconnectedUser, newChatUsers] = userDisconnect(
      socket.id,
      chatUsers
    );

    // Updating chatUsers array (we filtered disconnected user in a step before)
    chatUsers = [...newChatUsers];

    if (disconnectedUser) {
      io.emit('userDisconnected', chatUsers);
    }
  });
});

// Creating a server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Handling unhandled rejections
process.on('unhandledRejection', (reason) => {
  console.log(`UNHANDLED REJECTION! 💥 SHUTTING DOWN...`);
  console.log(`REASON: ${reason.errmsg}`);
  server.close(() => process.exit(1));
});
