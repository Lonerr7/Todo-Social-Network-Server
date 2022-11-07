const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const app = require('./app');
const socketio = require('socket.io');
const { formatMessage } = require('./utils/helpers');
const botName = 'Chat Bot';
const User = require('./models/userModel');
const { userJoin, userDisconnect } = require('./utils/chatUsers');

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
io.on('connection', (socket) => {
  // Logic when user joins chat
  socket.on('joinChat', async ({ userId }) => {
    const userDB = await User.findById(userId);
    const joinedUser = userJoin(userDB, socket.id, chatUsers);

    // Broadcast when a user connects
    socket.broadcast.emit(
      'botMessage',
      formatMessage(
        botName,
        `${joinedUser.nickname} has joined a chat`,
        'fromBot'
      )
    ); // this will send message to everyone except user that's connecting

    // Send array of joined user to front-end
    io.emit('userJoined', chatUsers);
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
  socket.on('disconnect', () => {
    // Getting current disconnected user and updated array of connected users
    const [disconnectedUser, newChatUsers] = userDisconnect(
      '',
      socket.id,
      chatUsers
    );

    // Updating chatUsers array (we filtered disconnected user in a step before)
    chatUsers = [...newChatUsers];

    if (disconnectedUser) {
      io.emit('userDisconnected', chatUsers);

      io.emit(
        'disconnectMessage',
        formatMessage(
          botName,
          `${disconnectedUser.nickname} has left the chat!`,
          'fromBot'
        )
      );
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
