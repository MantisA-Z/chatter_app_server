const groupModel = require("../models/groups");

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

    //If everything is correct and user is in the group then allow him to update group
    //check if there is an edit field or not
    if (!edit) {
      res.status(200).json({ group });
      return;
    }
  } catch (err) {
    res.status(500).json({ err: "Internal server error" });
    return;
  }
};

module.exports = updateGroup;
