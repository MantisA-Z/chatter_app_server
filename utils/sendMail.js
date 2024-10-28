const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  secure: false,
  port: 587,
  auth: {
    user: process.env.MAIL_ADDRESS,
    pass: process.env.MAIL_PASS,
  },
});

async function sendMail(receiver, subject, text) {
  try {
    await transporter.sendMail({
      from: {
        name: "CHAT_APP",
        address: process.env.MAIL_ADDRESS,
      },
      to: receiver,
      subject: subject,
      text: text,
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    console.log(receiver);
    throw new Error("Email could not be sent");
  }
}

module.exports = sendMail;
