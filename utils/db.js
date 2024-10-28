const mongoose = require("mongoose");

const connectDB = async () => {
  const DB_URL = process.env.MONGO_DB_CONNECT_URL;
  try {
    const db = await mongoose.connect(DB_URL);
    console.log(`MONGO DB database connected!`);
  } catch (err) {
    console.log(`Mongo db connection error: ${err}`);
  }
};

module.exports = connectDB;
