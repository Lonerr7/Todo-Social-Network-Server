const fs = require('fs');

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/users.json`).toString()
);

exports.getAllUsers = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
};

exports.getUser = (req, res) => {
  const user = users.find((user) => user.id === +req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
};

exports.createUser = (req, res) => {
  const newId = users[users.length - 1].id + 1;
  const newUser = { id: newId, ...req.body };

  users.push(newUser);
  fs.writeFile(
    `${__dirname}/dev-data/users.json`,
    JSON.stringify(users),
    () => {
      res.status(201).json({
        status: 'success',
        data: {
          user: newUser,
        },
      });
    }
  );
};

exports.updateUser = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: 'Updated User',
    },
  });
};

exports.deleteUser = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
