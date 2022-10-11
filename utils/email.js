const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.SITE_EMAIL, // Sender address
        to: options.to, // List of recipients
        subject: options.subject, // Subject line
        text: options.text, // Plain text body
   };

    await transport.sendMail(mailOptions);
}
module.exports = sendEmail;