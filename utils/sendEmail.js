const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

module.exports = async function sendEmail(to, subject, html) {
  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to,
    subject,
    html
  };

  await transporter.sendMail(mailOptions);
};