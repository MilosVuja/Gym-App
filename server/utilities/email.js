const nodemailer = require('nodemailer');

const sendEmail = async options => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    },
  });

  const mailOptions = {
    from: 'Milos Vujicic <milos.vujicic.dev@gmail.com>',
    to: options.to,
    subject: options.subject,
    html: options.html || options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
