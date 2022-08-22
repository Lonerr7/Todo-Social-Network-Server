const nodemailer = require('nodemailer');

const sendEmail = async ({ toEmail, subject, message }) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'nic3guy <nic3guy@gmail.com>',
    to: toEmail,
    subject,
    text: message,
  };

  // 3) Send the email via nodemailer
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
