const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "ds37lbv6c",
  api_key: "419288778332398",
  api_secret: "5sDLyYSseOyxHH_ek-zsG8-cz8k",
});

const uploadToCloudinary = async (file) => {
  try {
    console.log(file);
    const response = await cloudinary.uploader.upload(file);
    return { url: response.url, success: true };
  } catch (err) {
    return { success: false, err };
  }
};

module.exports = { cloudinary, uploadToCloudinary };
