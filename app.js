const express = require('express');
const fs = require('fs');

const users = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/users.json`));

//* =================== Creating an express app ===================

const app = express();

//* =================== Middlewares ===================

app.use(express.json());

//* =================== Routing ===================

app.get('/api/v1/users/', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

app.post('/api/v1/users', (req, res) => {
  const newId = users[users.length - 1].id + 1;
  const newUser = { id: newId, ...req.body };

  users.push(newUser);
  fs.writeFile(
    `${__dirname}/dev-data/users.json`,
    JSON.stringify(users),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          user: newUser,
        },
      });
    }
  );
});

//* =================== Starting a server ===================

const port = 8000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
