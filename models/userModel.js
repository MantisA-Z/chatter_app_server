const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  connectionId: {
    type: String,
    required: true,
    unique: true,
  },
  groups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "group",
    },
  ],
  globalMsg: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "globalMsg",
    },
  ],
  verified: {
    type: Boolean,
    default: false,
  },
});

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
