// import needed modules
const User = require("../db/models/user");

const authenticateUser = async (req, res) => {
  const body = req.body;

  if (!body) {
    return res.status(200).json({
      status: 'fail',
      message: 'Data sent is not correct',
      data: null
    });
  }

  await User.findOne({ username: body.username, password: body.password }, (err, user) => {
    if (err) {
      return res.status(200).json({
        status: 'error',
        message: 'Error occurs while signing in',
        data: { errorCode: err }
      });
    }

    if (!user) {
      return res.status(200).json({
        status: 'fail',
        message: 'Wrong username or password',
        data: null
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Login Successful',
      data: user
    });

  }).catch(err => {
    return res.status(200).json({
      status: 'error',
      message: 'Wrong username or password',
      data: { errorCode: err }
    });
  })
}

// fuction to create new user
const createUser = (req, res) => {
  const body = req.body;

  if (!body) {
    return res.status(200).json({
      status: 'fail',
      message: 'Data sent is not correct',
      data: null
    });
  }

  const user = new User(body);

  if (!user) {
    return res.status(200).json({
      status: 'fail',
      message: 'Cannot create new user',
      data: null
    });
  }

  user
    .save()
    .then(() => {
      return res.status(201).json({
        status: 'success',
        message: 'New user created successfully',
        data: user
      });
    })
    .catch(error => {
      return res.status(200).json({
        status: 'error',
        message: 'User either exists or cannot be created',
        data: { errorCode: error }
      });
    });
}

// function to update existing user
const updateUser = (req, res) => {
  const body = req.body;

  if (!body) {
    return res.status(200).json({
      status: 'fail',
      message: 'Data sent is not correct',
      data: null
    });
  }

  User.findOne({ _id: req.params.id }, (err, user) => {
    if (err) {
      return res.status(200).json({
        status: 'error',
        message: 'User not found',
        data: { errorCode: err }
      });
    }

    user.name = body.name;
    user.email = body.email;
    user.phone = body.phone;
    user.username = body.username;
    user.userType = body.userType;

    user
      .save()
      .then(() => {
        return res.status(200).json({
          status: 'success',
          message: 'User updated successfully',
          data: user
        });
      })
      .catch(error => {
        return res.status(200).json({
          status: 'error',
          message: 'User not updated',
          data: { errorCode: error }
        });
      });
  });
}

// function to delete existing user
const deleteUser = async (req, res) => {
  await User.findOneAndDelete({ _id: req.params.id }, (err, rows) => {
    if (err) {
      return res.status(200).json({
        status: 'error',
        message: 'Cannot delete user',
        data: { errorCode: err }
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
      data: rows
    });
  }).catch(err => {
    return res.status(200).json({
      status: 'error',
      message: 'Cannot delete user',
      data: { errorCode: err }
    });
  });
}

// function to get existing user
const getUserById = async (req, res) => {
  await User.findOne({ _id: req.params.id }, (err, user) => {
    if (err) {
      return res.status(200).json({
        status: 'error',
        message: 'Cannot find user',
        data: { errorCode: err }
      });
    }

    if (!user) {
      return res.status(200).json({
        status: 'fail',
        message: 'User not found',
        data: null
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'User data fetched successfully',
      data: user
    });

  }).catch(err => {
    return res.status(200).json({
      status: 'error',
      message: 'Cannot find user',
      data: { errorCode: err }
    });
  });
}

// function to get all existing users
const getUsers = async (req, res) => {
  await User.find({}, (err, users) => {
    if (err) {
      return res.status(200).json({
        status: 'error',
        message: 'Cannot find users',
        data: { errorCode: err }
      });
    }

    if (!users.length) {
      return res.status(200).json({
        status: 'fail',
        message: 'Users not found',
        data: null
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Users fetched successfully',
      data: users
    });

  }).catch(err => {
    return res.status(200).json({
      status: 'error',
      message: 'Cannot find users',
      data: { errorCode: err }
    });
  });
}

// function to change user old password
const changePassword = (req, res) => {
  const body = req.body;

  if (!body) {
    return res.status(200).json({
      status: 'fail',
      message: 'Data sent is not correct',
      data: null
    });
  }

  User.findOne({ _id: req.params.id }, (err, user) => {
    if (err) {
      return res.status(200).json({
        status: 'error',
        message: 'Old password is not correct',
        data: { errorCode: err }
      });
    }

    if (!user) {
      return res.status(200).json({
        status: 'fail',
        message: 'User not found',
        data: null
      });
    }

    if (user.password !== body.oldPassword) {
      return res.status(200).json({
        status: 'fail',
        message: 'Old password is not correct',
        data: null
      });
    }

    user.password = body.newPassword;

    user
      .save()
      .then(() => {
        return res.status(200).json({
          status: 'success',
          message: 'Password updated successfully',
          data: user
        });
      })
      .catch(error => {
        return res.status(200).json({
          status: 'error',
          message: 'Password not updated',
          data: { errorCode: error }
        });
      });
  });
}

// export functions
module.exports = {
  authenticateUser,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  getUsers,
  changePassword
}