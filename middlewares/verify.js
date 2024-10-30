const JWT = require("jsonwebtoken");

const verifyUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    res.status(401).json({ success: false, msg: "Unauthorized" });
    return;
  }
  const token = authHeader.split(" ")[1];

  const JWT_SECRET = process.env.JWT_SECRET;
  try {
    const decoded = JWT.verify(token, JWT_SECRET);
    req.token = decoded;
  } catch (err) {
    res.status(401).json({ success: false, msg: "Unauthorized" });
    return;
  }

  res.status(200).json({ verified: true });
  next();
};

module.exports = verifyUser;
