const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const app = require('./app');
const socketio = require('socket.io');
const { formatMessage } = require('./utils/helpers');
const botName = 'Chat Bot';
const User = require('./models/userModel');
const ChatUser = require('./models/chatUserModel');

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

// Run when client connects
io.on('connection', (socket) => {
  // Initialzie chatUser
  let chatUser;

  socket.on('joinChat', async ({ id }) => {
    // Get connected user from all users
    const connectedUser = await User.findById(id);
    const { firstName, lastName, nickname, photo } = connectedUser;

    // Add this user to the chat DB
    const chatUserFields = {
      firstName,
      lastName,
      nickname,
      photo,
    };

    chatUser = await ChatUser.create(chatUserFields);

    // Broadcast when a user connects
    socket.broadcast.emit(
      'botMessage',
      formatMessage(botName, `${chatUser.nickname} has joined a chat`, true)
    ); // this will send message to everyone except user that's connecting
  });

  // Listen for chatMessage
  socket.on('chatMessage', async (message) => {
    const user = await User.findById(message.userId);

    if (!user) {
      io.emit('message', formatMessage('__UNKNOWN__', message.message));
    }

    io.emit('message', formatMessage(user, message.message));
  });

  // Runs when client disconnects
  socket.on('disconnect', async () => {
    await ChatUser.deleteOne(chatUser);

    io.emit(
      'disconnectMessage',
      formatMessage(botName, 'A user has left the chat!', true)
    );
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
