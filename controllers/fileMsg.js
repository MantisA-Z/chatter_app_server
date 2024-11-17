const groupsModel = require("../models/groups");
const userModel = require("../models/userModel");
const { uploadToCloudinary } = require("../utils/cloudinary");

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

const fileMsgController = async (req, res) => {
  if (!req.body) return;
  const { connectionId, groupId, msg } = req.body;
  console.log("called");
  let type;
  if (msg.fileType.startsWith("image")) {
    type = "image";
  } else if (msg.fileType.startsWith("video")) {
    type = "video";
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
    if (!file) return;
    console.log(file);

    //Send msg to client save it to DB according to their file type
    /* if (type === "image") {
      group.chat.push({
        from: user.name,
        msg: { type: type, image: file.url, text: msg.captions },
        createdAt,
      });
    } else if (type === "video") {
      group.chat.push({
        from: user.name,
        msg: { type: type, video: file.url, text: msg.captions },
        createdAt,
      });
    } else if (type === "document") {
      group.chat.push({
        from: user.name,
        msg: { type: type, document: file.url, text: msg.captions },
        createdAt,
      });
    }
    await group.save();
    console.log(group.chat); */
  } catch (err) {
    console.log(`Error in user:file-msg ${err}`);
  }
};

module.exports = fileMsgController;
