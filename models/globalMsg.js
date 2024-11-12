const mongoose = require("mongoose");
const globalMsgSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  msg: { type: Object, required: true },
});

const globalMsgModel = mongoose.model("globalMsg", globalMsgSchema);
module.exports = globalMsgModel;
