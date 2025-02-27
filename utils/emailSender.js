import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  
  const info = await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    text,
    html
  });
  
  return info;
};

const sendResetPasswordEmail = async ({ name, email, resetToken, expiryTime }) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const subject = "Password Reset Request";
  
  const htmlMessage = `     
    <div>
      <h2>Reset Your Password</h2>
      <p>Hello${name ? ` ${name}` : ''},</p>
      <p>You requested to reset your password. Please click the button below to set a new password:</p>
      <div>
        <a href="${resetUrl}" style="padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
      </div>
      <p>This link will expire in ${expiryTime}.</p>
      <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
      <p>Regards,<br>Admin Team</p>
    </div>
  `;
  
  const textMessage = `
    Reset Your Password
    
    Hello${name ? ` ${name}` : ''},
    
    You requested to reset your password. Please use the link below to set a new password:
    
    ${resetUrl}
    
    This link will expire in ${expiryTime}.
    
    If you did not request a password reset, please ignore this email or contact support if you have concerns.
    
    Regards,
    Admin Team
  `;
  
  return sendEmail({
    to: email,
    subject,
    html: htmlMessage,
    text: textMessage
  });
};


export {
  sendResetPasswordEmail,
  sendEmail
};