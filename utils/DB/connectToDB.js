const { getIsInDevMode } = require('../getIsInDevMode');
const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

exports.connectToDB = async function() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const DB = getIsInDevMode()
      ? process.env.DATABASE
      : process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD);

    const opts = {
      bufferCommands: false, // Отключает буферизацию: Mongoose сразу выбросит ошибку, если нет сети, вместо ожидания 10 сек
    };

    cached.promise = mongoose.connect(DB, opts).then((mongoose) => {
      console.log('DB Connection successful');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
