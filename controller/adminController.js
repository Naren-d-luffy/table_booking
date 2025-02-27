import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../model/admin.model.js";
import {adminValidation} from "../validator/admin.validator.js";
import sendResetPasswordEmail from "../utils/resetPasswordEmail.js";
import {validateResetPassword} from "../validator/admin.validator.js";

export const createAdmin = async (req, res) => {
  try {
    const adminData = req.body;

    const { error } = adminValidation.validate(adminData);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    const admin = new Admin({
      ...adminData,
      password: hashedPassword,
      status: adminData.status || "ACTIVE",
    });

    const newAdmin = await admin.save();
    res.status(201).json({ message: "Admin created successfully", data: newAdmin });
  } catch (error) {
    res.status(500).json({ error: "Error Creating Admin", message: error.message });
  }
};

export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    if (!admins.length) {
      return res.status(404).json({ message: "No admins found" });
    }
    res.status(200).json({ message: "Admins fetched successfully", data: admins });
  } catch (error) {
    res.status(500).json({ error: "Error Fetching Admins", message: error.message });
  }
};

export const getAdminById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Admin ID is required" });
  }

  try {
    const admin = await Admin.findById(id).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json({ message: "Admin fetched successfully", data: admin });
  } catch (error) {
    res.status(500).json({ error: "Error Fetching Admin by ID", message: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) return res.status(404).json({ message: "User Not Found" });

    if (admin.status === "INACTIVE") {
      return res.status(403).json({ message: "Account Inactive. Contact Admin." });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid Password" });

    const payload = { id: admin.id, status: admin.status, role: admin.role };
    const accessToken = jwt.sign(payload, process.env.ACCESS_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn: "7d" });

    const { password: _, ...safeAdminData } = admin.toObject();
    res.status(200).json({ message: "Login Successful", accessToken, refreshToken, admin: safeAdminData });
  } catch (error) {
    res.status(500).json({ error: "Login Failed", message: error.message });
  }
};

export const changeStatus = async (req, res) => {
  try {
    if (req.user.role !== "Admin") return res.status(403).json({ message: "Access Denied. Admins only." });
    const {adminId} = req.params;
    const { status } = req.body;

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(adminId, { status }, { new: true });

    if (!updatedAdmin) return res.status(404).json({ message: "Admin not found" });

    res.status(200).json({ message: `Admin status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ error: "Error Changing Status", message: error.message });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Access Denied. Admins only." });

    const { adminId } = req.params;

    const deletedAdmin = await Admin.findByIdAndDelete(adminId);

    if (!deletedAdmin) return res.status(404).json({ message: "Admin not found" });

    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error Deleting Admin", message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: "Email is required" 
      });
    }

    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return res.status(200).json({ 
        success: true,
        message: "If an account with that email exists, a reset link has been sent" 
      });
    }

    if (admin.status === "INACTIVE") {
      return res.status(403).json({ 
        success: false,
        message: "Account is inactive. Please contact an administrator." 
      });
    }

    const resetToken = jwt.sign(
      { 
        id: admin._id,
        email: admin.email,
        passwordFingerprint: admin.password.substring(0, 10)
      }, 
      process.env.JWT_RESET_SECRET || process.env.ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    try {
      await sendResetPasswordEmail({
        name: admin.name,
        email: admin.email,
        resetToken,
        expiryTime: '15 minutes'
      });

      return res.status(200).json({ 
        success: true,
        message: "If an account with that email exists, a reset link has been sent" 
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      
      return res.status(500).json({ 
        success: false,
        message: "Could not send email. Please try again later."
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const { error } = validateResetPassword.validate({ 
      token, 
      newPassword 
    });
    
    if (error) {
      return res.status(400).json({ 
        success: false,
        message: error.details[0].message 
      });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_RESET_SECRET || process.env.ACCESS_SECRET);
    } catch (jwtError) {
      return res.status(400).json({ 
        success: false,
        message: "Password reset token is invalid or has expired" 
      });
    }
    
    const admin = await Admin.findById(decoded.id);
    
    if (!admin) {
      return res.status(400).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    if (admin.email !== decoded.email) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid token" 
      });
    }
    
    if (!admin.password.startsWith(decoded.passwordFingerprint)) {
      return res.status(400).json({ 
        success: false,
        message: "Password has already been reset" 
      });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    admin.password = hashedPassword;
    admin.passwordChangedAt = Date.now();
    await admin.save();
    
    const payload = { 
      id: admin._id, 
      status: admin.status, 
      role: admin.role 
    };
    
    const accessToken = jwt.sign(
      payload, 
      process.env.ACCESS_SECRET,
      { expiresIn: "15m" }
    );
    
    const refreshToken = jwt.sign(
      payload, 
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" }
    );
    
    res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};