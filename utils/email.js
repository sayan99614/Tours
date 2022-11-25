const nodemailer = require("nodemailer");
const sendEmail = async (args) => {
  //create the email transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_AUTH_USER,
      pass: process.env.EMAIL_AUTH_PASSWORD,
    },
  });
  //define the email options
  const options = {
    from: "dheeman pati 💯 <patidheeman@netours.com>",
    to: args.email,
    subject: "Password change request for your account (valid for 10 min)",
    text: args.text,
  };

  //actually send the email
  await transporter.sendMail(options);
};

module.exports = sendEmail;
