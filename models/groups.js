const mongoose = require("mongoose");
const groupsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  members: [String],
  chat: [
    {
      from: { type: String, required: true },
      msg: { type: String, required: true },
      createdAt: { type: String },
    },
  ],
  logo: {
    type: String,
  },
});

const groupsModel = mongoose.model("group", groupsSchema);
module.exports = groupsModel;
