const { Server, Socket } = require("socket.io");
const JWT = require("jsonwebtoken");
const groupsModel = require("../models/groups");
const userModel = require("../models/userModel");
const globalMsgModel = require("../models/globalMsg");
const { uploadToCloudinary } = require("./cloudinary");

function formatDate(date) {
  const options = { month: "2-digit", day: "2-digit", year: "numeric" };
  const formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);

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

const setUpSocketServer = (server) => {
  const connectionIdMap = new Map();

  const io = new Server(server, {
    cors: true,
    maxHttpBufferSize: 50 * 1024 * 1024, // 10MB buffer size
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
      } catch (err) {
        console.log(err);
      }
    });

    socket.on("user:room-invite", async ({ connectionId, group }) => {
      //First ensure there is a group like that and the user with that connection Id exists
      const groupInstance = await groupsModel.findOne({ _id: group._id });
      const user = await userModel.findOne({ connectionId });

      if (connectionIdMap.has(connectionId) && groupInstance && user) {
        //Firstly send invite via socket connection
        io.to(connectionIdMap.get(connectionId)).emit("server:group-invite", {
          groupId: groupInstance._id,
          group: groupInstance,
          text: `You have been invited to join ${groupInstance.name} by a group member.`,
        });

        //Then update the database
        const msg = await globalMsgModel.create({
          from: group.name,
          to: connectionId,
          msg: {
            groupId: groupInstance._id,
            group: groupInstance,
            text: `You have been invited to join ${groupInstance.name} by a group member.`,
          },
        });
        user.globalMsg.push(msg._id);
        await user.save();
      }
    });

    socket.on("user:file-msg", async ({ connectionId, groupId, msg }) => {
      console.log("called");
      let type;
      if (msg.fileType.startsWith("image")) {
        type = "image";
      } else if (msg.fileType.startsWith("video")) {
        type = "video";
      } else if (msg.fileType.startsWith("audio")) {
        type = "audio";
      } else {
        type = "document";
      }
      try {
        const group = await groupsModel.findOne({ _id: groupId });
        const user = await userModel.findOne({ connectionId });
        if (!group || !user) return;

        const now = new Date();
        const createdAt = formatDate(now);
        const file = await uploadToCloudinary(msg.file);
        console.log(file);
        if (!file) return;
        const fileUrl = file.url;

        //Send msg to client first via socket connection and then save it to DB according to their file type
        if (type === "image") {
          io.to(groupId).emit("server:file-msg", {
            from: user.name,
            msg: { type: type, image: fileUrl, text: msg.captions },
            groupId,
          });
          group.chat.push({
            from: user.name,
            msg: { type: type, image: fileUrl, text: msg.captions },
            createdAt,
          });
        } else if (type === "video") {
          io.to(groupId).emit("server:file-msg", {
            from: user.name,
            msg: { type: type, video: fileUrl, text: msg.captions },
            groupId,
          });
          group.chat.push({
            from: user.name,
            msg: { type: type, video: fileUrl, text: msg.captions },
            createdAt,
          });
        } else if (type === "audio") {
          io.to(groupId).emit("server:file-msg", {
            from: user.name,
            msg: { type: type, audio: fileUrl, text: msg.captions },
            groupId,
          });
          group.chat.push({
            from: user.name,
            msg: { type: type, audio: fileUrl, text: msg.captions },
            createdAt,
          });
        } else if (type === "document") {
          io.to(groupId).emit("server:file-msg", {
            from: user.name,
            msg: { type: type, document: fileUrl, text: msg.captions },
            groupId,
          });
          group.chat.push({
            from: user.name,
            msg: { type: type, document: fileUrl, text: msg.captions },
            createdAt,
          });
        }
        await group.save();
        console.log(group.chat);
      } catch (err) {
        console.log(`Error in user:file-msg ${err}`);
        return;
      }
    });
    socket.on("user:initiate-call", ({ group }) => {
      io.to(group._id).emit("server:user-calling");
    });
  });
};

module.exports = { setUpSocketServer };
