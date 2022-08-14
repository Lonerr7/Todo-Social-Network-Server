const express = require('express');
const fs = require('fs');

const users = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/users.json`));

//* Creating an express app
const app = express();

//* Routing
app.get('/api/v1/users/', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

//* Starting a server
const port = 8000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
