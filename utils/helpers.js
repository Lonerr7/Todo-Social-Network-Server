const { v4: uuid } = require('uuid');

exports.createUserInfoArr = (data, neededKeys) => {
  console.log({ data }, neededKeys);

  return Object.keys(data)
    .map((key) => {
      if (neededKeys.includes(key)) {
        return {
          [key]: data[key],
        };
      }

      return null;
    })
    .filter((key) => key !== null);
};

exports.formatMessage = (user, msg, fromBot) => {
  // if (fromBot === 'fromBot') {
  //   return {
  //     text: msg,
  //     id: uuid(),
  //     fromBot: true,
  //     userId: user.id, // because we pass here formatted joinedUser
  //     username: user.nickname,
  //   };
  // }

  return {
    username: user.nickname,
    text: msg,
    avatar: user.photo,
    id: user._id,
  };
};
