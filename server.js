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

    // push new user to chatUsers and return it from this function
    userJoin(userFromDB, socket.id, chatUsers);

    // Broadcast when a user connects
    // socket.broadcast.emit(
    //   'botMessage',
    //   formatMessage(joinedUser, `has joined a chat`, 'fromBot')
    // );

    // Send array of joined user to front-end
    io.emit('userJoined', chatUsers);
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

    // if (!user) {
    //   return io.emit('message', formatMessage('__UNKNOWN__', message.text));
    // }

    io.emit('message', newMessage);
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

      // io.emit(
      //   'botMessage',
      //   formatMessage(
      //     disconnectedUser,
      //     `has left the chat!`,
      //     'fromBot'
      //   )
      // );
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
