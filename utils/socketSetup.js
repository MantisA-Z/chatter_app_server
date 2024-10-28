const { Server, Socket } = require("socket.io");

const setUpSocketServer = (server) => {
  const io = new Server(server, {
    cors: true,
  });
  console.log("socket server setup complete");

  io.on("connection", (socket) => {
    console.log(`New socket connection socket Id: ${socket.id}`);
  });
};

module.exports = { setUpSocketServer };
