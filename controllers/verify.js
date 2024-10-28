const tokenModel = require("../models/token");
const userModel = require("../models/userModel");

const verifyController = async (req, res) => {
  const { userId, token } = req.params;
  const userToken = await tokenModel.findOne({ token });
  if (userToken) {
    await userModel.findOneAndUpdate({ _id: userId }, { verified: true });
    await userToken.deleteOne();
    res.send("Your CHAT_APP account has been verified!");
  } else {
    res.send("False link");
  }
};

module.exports = verifyController;
