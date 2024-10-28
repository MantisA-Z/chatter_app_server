const User = require("../models/userModel");
const Token = require("../models/token");
const sendMail = require("../utils/sendMail");
const crypto = require("crypto");
const { v4: uuid } = require("uuid");

const signup = async (req, res) => {
  const checkReqValidity = (name, email, password) => {
    if (name.trim() === "") {
      console.log("fill name");
      return false;
    } else if (email.trim() === "") {
      console.log("fill email");
      return false;
    } else if (password.trim() === "") {
      console.log("fill password");
      return false;
    }
    return true;
  };

  if (!req.body) {
    res.status(204).send("Not enough info");
    return;
  }
  const { name, email, password } = req.body;
  const validity = checkReqValidity(name, email, password);

  if (!validity) {
    res.status(204).send("Not enough info");
    return;
  }

  try {
    const connectionId = uuid();
    const user = new User({
      name,
      email,
      password,
      connectionId,
    });
    const userObj = await user.save();
    const baseURL = process.env.BASE_URL;

    //Save the user Token for verification and send the verification link to the user email using the send mail fnc
    const token = crypto.randomBytes(32).toString("hex");
    const tokenInstance = new Token({
      userId: user._id,
      token,
    });
    await tokenInstance.save();
    await sendMail(
      email,
      "Verify CHAT_APP account",
      `click on this url to verify your account on CHAT_APP: ${baseURL}/verify/${user._id}/${token}`
    );

    console.log(`New user added to cluster: ${userObj}`);
    res.json({ success: true, userObj });
  } catch (err) {
    console.log("Duplicate user error", err);
    res.json({ success: false, errorType: "duplicate" });
  }
};

module.exports = signup;
