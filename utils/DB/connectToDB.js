const { getIsInDevMode } = require('../getIsInDevMode');
const mongoose = require('mongoose');

exports.connectToDB = () => {
  const DB = process.env.DATABASE;
  mongoose.connect(DB).then(() => {
    if (getIsInDevMode()) {
      console.log(`LOCAL DB CONNECTION SUCCESSFUL`);
    } else {
      console.log(`DB CONNECTION SUCCESSFUL remote DB`);
    }
  });
};
