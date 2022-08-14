const express = require('express');

const app = express();

// Routing
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Hello from the server!'
  });
});

app.post('/', (req, res) => {
  res.send('You can post to this endpoint!')
})

// Starting a server
const port = 8000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
