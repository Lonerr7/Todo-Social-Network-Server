const express = require('express');
const fs = require('fs');

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/users.json`).toString()
);

//* =================== Creating an express app ===================

const app = express();

//* =================== Middlewares ===================

app.use(express.json());

//* =================== Routing ===================

const getAllUsers = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
};

const getUser = (req, res) => {
  const user = users.find((user) => user.id === +req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
};

const createUser = (req, res) => {
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

const updateUser = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: 'Updated User',
    },
  });
};

const deleteUser = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

app.route('/api/v1/users').get(getAllUsers).post(createUser);
app
  .route('/api/v1/users/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

//* =================== Starting a server ===================

const port = 8000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
