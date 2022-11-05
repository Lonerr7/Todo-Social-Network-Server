const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const app = require('./app');
const socketio = require('socket.io');

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
  // Welcome current user
  socket.emit('message', 'Welcome to my chat!'); // this will send message only to a user who is connecting

  // Broadcast when a user connects
  socket.broadcast.emit('message', 'A user has joined a chat'); // this will send message to everyone except user that's connecting

  // Runs when client disconnects
  socket.on('disconnect', () => {
    io.emit('disconnectMessage', 'A user has left the chat!');
  });

  // Listen for chatMessage
  socket.on('chatMessage', (message) => {
    io.emit('message', message)
  });

  // io.emit(); // send message to EVERYBODY
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
