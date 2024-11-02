const { Server, Socket } = require("socket.io");
const JWT = require("jsonwebtoken");
const groupsModel = require("../models/groups");
const userModel = require("../models/userModel");

const setUpSocketServer = (server) => {
  const connectionIdMap = new Map();

  const io = new Server(server, {
    cors: true,
  });
  console.log("socket server setup complete");

  io.on("connection", (socket) => {
    console.log(`New socket connection socket Id: ${socket.id}`);

    socket.on("user:connection-id", async ({ token }) => {
      const JWT_SECRET = process.env.JWT_SECRET;
      const decoded = JWT.verify(token, JWT_SECRET);
      if (decoded) {
        const connectionId = decoded.connectionId;
        const getUserGroups = async () => {
          try {
            const user = await userModel
              .findOne({ connectionId })
              .populate("groups");
            return user.groups;
          } catch (err) {
            console.log(err);
            return;
          }
        };
        const groups = await getUserGroups();
        connectionIdMap.set(connectionId, socket.id);
        socket.emit("server:user-connectionId", { connectionId, groups });
      }
    });

    socket.on(
      "user:create-new-room",
      async ({ name, connectionId, logoImgUrl }) => {
        try {
          const groupInstance = await groupsModel.create({
            name,
            members: [connectionId],
            logo: logoImgUrl,
          });

          //update the user to add the new group in his user doc
          const user = await userModel.findOne({ connectionId });
          user.groups.push(groupInstance._id);
          await user.save();

          //make the user join room and emit event
          socket.join(groupInstance._id);
          socket.emit("server:created-new-room", {
            name,
            logoImgUrl,
            groupInstance,
          });
        } catch (err) {
          console.log(`socket user creation error: ${err}`);
          throw new Error(err);
        }
      }
    );
  });
};

module.exports = { setUpSocketServer };
