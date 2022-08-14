import express from 'express';
import fs from 'fs';

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/users.json`).toString()
);

//* =================== Creating an express app ===================

const app = express();

//* =================== Middlewares ===================

app.use(express.json());

//* =================== Routing ===================

// Getting all users
app.get('/api/v1/users/', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

// Getting a user
app.get('/api/v1/users/:id', (req, res) => {
  const user = users.find((user: any) => user.id === +req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// "Creating" a user
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
