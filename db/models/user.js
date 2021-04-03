// import needed modules
const mongoose = require("mongoose");

// create schema
const User = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, required: true, default: 'USER' },
  },
  {
    timestamps: true
  },
);

// export mongoose model
module.exports = mongoose.model("users", User);