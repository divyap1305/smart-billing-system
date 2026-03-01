const nodemailer = require('nodemailer');

// Create test account on the fly
const createTestTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
};

const sendOTPEmail = async (email, otp) => {
  const transporter = await createTestTransporter();
  const mailOptions = {
    from: '"Selvam Motors" <test@ethereal.email>',
    to: email,
    subject: 'Password Reset OTP',
    html: `<h2>Your OTP: ${otp}</h2><p>Valid for 10 minutes</p>`
  };
  
  const info = await transporter.sendMail(mailOptions);
  console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
};

module.exports = { sendOTPEmail };