import User from "../model/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userValidation } from "../validator/user.validator.js";

export const createUser = async (req, res) => {
  try {
    const userData = req.body;

    const { error } = userValidation.validate(userData);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = new User({
      ...userData,
      password: hashedPassword,
      status: userData.status || "ACTIVE",
      type: userData.type || "user",
    });

    const newuser = await user.save();
    res
      .status(201)
      .json({ message: "User Created Successfully", data: newuser });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error Creating User", message: error.message });
  }
};

export const createGuest = async (req, res) => {
  try {
    const guestData = req.body;

    const { error } = userValidation.validate(guestData);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const existingEmail = await User.findOne({ email: guestData.email });
    if (existingEmail) {
      return { error: "Email already exists" };
    }

    const existingMobile = await User.findOne({ mobile: guestData.mobile });
    if (existingMobile) {
      return { error: "Mobile number already exists" };
    }

    const user = new User({
      ...guestData,
      type: guestData.type || "guest",
      status: guestData.status || "ACTIVE",
    });

    const newuser = await user.save();
    res
      .status(201)
      .json({ message: "Guest Created Successfully", data: newuser });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error Creating Guest", message: error.message });
  }
};

