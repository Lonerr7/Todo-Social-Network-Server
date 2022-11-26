const nodemailer = require('nodemailer');
const path = require('path');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.firstName.split(' ')[0]; // ?
    this.url = url;
    this.from = process.env.EMAIL_FROM;
  }

  newTransport() {
    //* If we are in production
    if (process.env.NODE_ENV === 'production') {
      // Create a transporter for sendGrid
      return;
    }

    // 1) Create a transporter
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    console.log(template);
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(
      // `${__dirname}/../views/emails/${template.pug}`,
      path.join(__dirname, '..', 'views', 'emails', `${template}.pug`),
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    // 2) Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Todo Social Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your passwrod reset token (valid only for 10 minutes)'
    );
  }
};
