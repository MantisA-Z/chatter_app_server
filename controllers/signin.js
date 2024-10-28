const userModel = require("../models/userModel");
const tokenModel = require("../models/token");
const sendMail = require("../utils/sendMail");
const JWT = require("jsonwebtoken");
const crypto = require("crypto");

const signinController = async (req, res) => {
  const checkReqValidity = (email, password) => {
    if (email.trim() === "") {
      console.log("fill email");
      return false;
    } else if (password.trim() === "") {
      console.log("fill password");
      return false;
    }
    return true;
  };

  if (!req.body) {
    res.status(401).send("Not enough info");
    return;
  }
  const { email, password } = req.body;
  const validity = checkReqValidity(email, password);

  if (!validity) {
    res.status(401).send("Not enough info");
    return;
  }

  const user = await userModel.findOne({ email });
  if (!user) {
    res.status(401).json({ msg: "wrong credentials" });
    return;
  }

  let token = await tokenModel.findOne({ userId: user._id });
  if (!token) {
    token = crypto.randomBytes(32).toString("hex");
    const tokenInstance = new tokenModel({ userId: user._id, token });
    await tokenInstance.save();
  }

  if (user.verified === false) {
    const baseURL = process.env.BASE_URL;
    await sendMail(
      user.email,
      "Verify CHAT_APP account",
      `click on this url to verify your account on CHAT_APP: ${baseURL}/verify/${user._id}/${token}`
    );
    res.status(403).json({ msg: "Account not verified" });
    return;
  }

  const JWT_SECRET = process.env.JWT_SECRET;
  const payload = {
    name: user.name,
    email: user.email,
    connectionId: user.connectionId,
  };
  const JWT_TOKEN = JWT.sign(payload, JWT_SECRET);
  res.status(200).json({
    success: true,
    JWT_TOKEN,
  });
};

module.exports = signinController;
