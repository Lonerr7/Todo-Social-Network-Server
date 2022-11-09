exports.userJoin = (user, socketId, usersArr) => {
  const newUser = {
    nickname: user.nickname,
    photo: user.photo,
    id: user._id.toString(),
    socketId,
  };

  usersArr.push(newUser);

  return newUser;
};

exports.userDisconnect = (socketId, usersArr) => {
  const user = usersArr.find((u) => u.socketId === socketId);
  return [user, usersArr.filter((user) => user.socketId !== socketId)];
};
