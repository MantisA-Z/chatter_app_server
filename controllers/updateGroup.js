const groupModel = require("../models/groups");
const userModel = require("../models/userModel");

const updateGroup = async (req, res) => {
  const { groupId, edit } = req.body;
  const user = req.token;
  if (!user || !groupId) {
    res.status(401).json({ err: "unauthorized" });
    return;
  }
  try {
    let group = await groupModel.findOne({ _id: groupId });
    console.log(group);
    if (!group) {
      res.status(404).json({ err: "not found" });
      return;
    }

    if (!group.members.includes(user.connectionId)) {
      res.status(401).json({ err: "unauthorized" });
      return;
    }

    //If everything is correct and user is in the group then allow him to update group
    //check if there is an edit field or not
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
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Internal server error" });
    return;
  }
};

module.exports = updateGroup;
