require("dotenv").config();
const express = require("express");
const app = express();
const server = require("http").Server(app);
const cors = require("cors");
const connectDB = require("./utils/db");
const verifyMiddleware = require("./middlewares/verify");
const { setUpSocketServer } = require("./utils/socketSetup");

//controllers
const signupController = require("./controllers/signup");
const signinController = require("./controllers/signin");
const verifyController = require("./controllers/verify");

//Initialize database connection
connectDB();

//Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api", verifyMiddleware);

//Io connection
setUpSocketServer(server);

//Routes
app.get("/", (req, res) => {
  res.send("hello Mr white!");
});
app.post("/signup", signupController);
app.post("/signin", signinController);
app.get("/verify/:userId/:token", verifyController);
app.get("/api", (req, res) => {
  res.status(200).json({ verified: true });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log("server started at port: ", PORT);
});
