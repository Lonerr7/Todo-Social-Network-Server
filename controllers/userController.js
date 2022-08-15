exports.getAllUsers = (req, res) => {
  res.status(200).json({
    status: 'success',
  });
};

exports.getUser = (req, res) => {
  res.status(200).json({
    status: 'success',
  });
};

exports.createUser = (req, res) => {
  res.status(201).json({
    status: 'success',
  });
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

//* Middleware functions


