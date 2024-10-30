const { Server, Socket } = require("socket.io");
const JWT = require("jsonwebtoken");

const setUpSocketServer = (server) => {
  const connectionIdMap = new Map();

  const io = new Server(server, {
    cors: true,
  });
  console.log("socket server setup complete");

  io.on("connection", (socket) => {
    console.log(`New socket connection socket Id: ${socket.id}`);

    socket.on("user:connection-id", ({ token }) => {
      console.log("called");
      const JWT_SECRET = process.env.JWT_SECRET;
      const decoded = JWT.verify(token, JWT_SECRET);
      if (decoded) {
        const connectionId = decoded.connectionId;
        connectionIdMap.set(connectionId, socket.id);
        socket.emit("server:user-connectionId", { connectionId });
        console.log(connectionId);
      }
    });
  });
};

module.exports = { setUpSocketServer };
