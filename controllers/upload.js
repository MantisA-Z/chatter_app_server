const { uploadToCloudinary } = require("../utils/cloudinary");

const uploadController = async (req, res) => {
  try {
    const { file } = req.body;
    if (!file) {
      res.status(422).json({ err: "No file provided" });
      return;
    }
    const result = await uploadToCloudinary(file);
    console.log(result);
    if (!result.success) {
      res.status(500).json({ err: "Internal Server error" });
      return;
    }

    res.status(200).json({ fileUrl: result.url });
  } catch (err) {
    res.status(500).json({ err: "Internal Server error" });
    return;
  }
};

module.exports = uploadController;
