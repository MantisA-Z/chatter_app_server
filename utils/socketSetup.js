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
            user.groups.map((group, i) => {
              socket.join(group._id.toString());
              console.log(group._id.toString());
            });
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
            groupInstance,
          });
        } catch (err) {
          console.log(`socket user creation error: ${err}`);
          throw new Error(err);
        }
      }
    );

    socket.on("user:msg", async ({ connectionId, groupId, msg }) => {
      function formatDate(date) {
        const options = { month: "2-digit", day: "2-digit", year: "numeric" };
        const formattedDate = new Intl.DateTimeFormat("en-US", options).format(
          date
        );

        // Get hours and minutes
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";

        // Convert to 12-hour format
        hours = hours % 12;
        hours = hours === 0 ? 12 : hours; // Only change '0' to '12'

        // Format minutes to be two digits
        const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

        return `${formattedDate} ${hours}:${formattedMinutes} ${ampm}`;
      }

      try {
        const user = await userModel.findOne({ connectionId });
        if (!user) return;
        //First emit the message to Room for speed
        io.to(groupId).emit("server:room-msg", {
          msg,
          from: user.name,
          groupId,
        });

        const group = await groupsModel.findOne({ _id: groupId });
        if (!group) return;
        const now = new Date();
        const createdAt = formatDate(now);
        group.chat.push({ from: user.name, msg, createdAt });
        const updatedGroup = await group.save();
        console.log(updatedGroup);
        console.log(groupId);
      } catch (err) {
        console.log(err);
      }
    });
  });
};

module.exports = { setUpSocketServer };
