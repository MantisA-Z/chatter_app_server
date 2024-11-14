const groupModel = require("../models/groups");
const userModel = require("../models/userModel");
const { uploadToCloudinary } = require("../utils/cloudinary");

const updateGroup = async (req, res) => {
  const { groupId, edit } = req.body;
  const user = req.token;
  if (!user || !groupId) {
    res.status(401).json({ err: "unauthorized" });
    return;
  }
  try {
    const group = await groupModel.findOne({ _id: groupId });
    if (!group) {
      res.status(404).json({ err: "not found" });
      return;
    }

    if (!group.members.includes(user.connectionId)) {
      res.status(401).json({ err: "unauthorized" });
      return;
    }

    //check if there is an edit field or not, if not then just send the group and members info
    if (!edit) {
      const members = await Promise.all(
        group.members.map(async (connectionId) => {
          const member = await userModel.findOne({ connectionId });
          return member;
        })
      );
      res.status(200).json({ group, members });
      return;
    }
    //If there is a edit in the req body then edi the group
    const e = {
      name: edit.name || group.name,
      logoFile: edit.logoFile || group.logoFile,
      remove: edit.remove || [],
    };
    try {
      const file = await uploadToCloudinary(e.logoFile);
      const updatedMembers = group.members.filter(
        (member, i) => !e.remove.includes(member)
      );
      group.name = e.name;
      group.logoFile = file.url;
      group.members = updatedMembers;
      const updatedGroup = await group.save();

      //update the removed users group key from the DB
      await Promise.all(
        e.remove.map(async (connectionId, i) => {
          const user = await userModel.findOne({ connectionId });
          if (!user) return;
          const userUpdatedGroups = user.groups.filter(
            (_id, i) => _id.toString() !== group._id.toString()
          );
          user.groups = userUpdatedGroups;
          await user.save();
        })
      );
      const members = await Promise.all(
        group.members.map(async (connectionId) => {
          const member = await userModel.findOne({ connectionId });
          return member;
        })
      );
      res.status(200).json({ group: updatedGroup, members });
    } catch (err) {
      console.log(err);
      res.status(500).json({ err: "Internal server error" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Internal server error" });
    return;
  }
};

module.exports = updateGroup;
