const userModel = require("../models/userModel");

const messagesController = async (req, res) => {
  const user = req.token;
  const userInstance = await userModel.findOne({
    connectionId: user.connectionId,
  });
  //Ensure there is a user token and a user in the db
  if (!user || !userInstance) {
    res.status(401).json({ err: "Not enough info" });
    return;
  }
  await userInstance.populate("globalMsg");
  res.status(200).json({ globalMessages: userInstance.globalMsg });
};

module.exports = messagesController;
