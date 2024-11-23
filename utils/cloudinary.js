const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "ds37lbv6c",
  api_key: "419288778332398",
  api_secret: "5sDLyYSseOyxHH_ek-zsG8-cz8k",
});

const uploadToCloudinary = async (file) => {
  try {
    const response = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });
    return {
      url: response.secure_url,
      success: true,
      response: response,
    };
  } catch (err) {
    return { success: false, err };
  }
};

const uploadBufferToCloudinary = (buffer, resourceType = "auto") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType }, // Set the resource type (image, video, etc.)
      (error, result) => {
        if (error) {
          return reject(error); // Reject if there's an error during upload
        }
        resolve(result.secure_url); // Resolve the promise with the URL of the uploaded file
      }
    );

    // Upload the buffer to Cloudinary
    uploadStream.end(buffer); // Send the buffer to Cloudinary
  });
};

module.exports = { cloudinary, uploadToCloudinary, uploadBufferToCloudinary };
