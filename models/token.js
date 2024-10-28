const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 1800,
  },
});

const tokenModel = mongoose.model("token", tokenSchema);
module.exports = tokenModel;
