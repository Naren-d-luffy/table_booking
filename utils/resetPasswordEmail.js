import nodemailer from "nodemailer";

const sendResetPasswordEmail = async ({ name, email, resetToken, expiryTime }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const subject = "Password Reset Request";
  
  const htmlMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>Hello${name ? ` ${name}` : ''},</p>
      <p>You requested to reset your password. Please click the button below to set a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
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
  
  const info = await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject,
    text: textMessage,
    html: htmlMessage
  });
  
  return info;
};

export default sendResetPasswordEmail