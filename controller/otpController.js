import bcrypt from "bcrypt";
import OTPModel from "../model/otp.model.js";
// import User from "../model/user.model.js";
import { sendEmail } from "../utils/emailSender.js";

export const sendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const lastOTP = await OTPModel.findOne({ email }).sort({ createdAt: -1 });
  if (lastOTP && lastOTP.expiresAt > Date.now() - 60000) {
    return res
      .status(429)
      .json({ message: "Wait 1 minute before requesting another OTP" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await OTPModel.create({
      email,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
    console.log(otp);

    res.status(202).json({ message: "OTP is being sent..." });

    setTimeout(async () => {
      try {
        await sendEmail({
          to: email,
          subject: "Your OTP Code",
          html: `
                <div>
                  <h2>Your One-Time Password</h2>
                  <p>Hello,</p>
                  <p>Your OTP code is: <strong>${otp}</strong></p>
                  <p>This code will expire in 5 minutes.</p>
                  <p>If you did not request this code, please ignore this email.</p>
                  <p>Regards,<br>Admin Team</p>
                </div>
              `,
          text: `
                Your One-Time Password
                
                Hello,
                
                Your OTP code is: ${otp}
                
                This code will expire in 5 minutes.
                
                If you did not request this code, please ignore this email.
                
                Regards,
                Admin Team
              `,
        });
        console.log(`OTP email sent to ${email}`);
      } catch (error) {
        console.error(`Failed to send OTP: ${error.message}`);
      }
    }, 0);
  } catch (error) {
    console.error("Database error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const validOTP = await OTPModel.findOne({ email });

  if (!validOTP) return res.status(400).json({ message: "Invalid OTP" });

  if (validOTP.expiresAt < Date.now()) {
    await OTPModel.deleteOne({ email });
    return res.status(400).json({ message: "OTP Expired" });
  }

  const isMatch = await bcrypt.compare(otp, validOTP.otp);
  if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

//   await User.updateOne({ email }, { verified: true });

  await OTPModel.deleteOne({ email });

  res.status(201).json({ message: "OTP Verified and deleted" });
};
