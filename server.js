const dotenv = require('dotenv');
const app = require('./app');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD);
mongoose.connect(DB).then(() => console.log(`DB CONNECTION SUCCESSFUL`));

// Creating a server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Handling unhandled rejections
process.on('unhandledRejection', (reason) => {
  console.log(`UNHANDLED REJECTION! 💥 SHUTTING DOWN...`);
  console.log(`REASON: ${reason.errmsg}`);
  server.close(() => process.exit(1));
});
