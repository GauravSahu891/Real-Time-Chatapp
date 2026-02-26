import crypto from "crypto";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import PendingSignup from "../models/pendingSignup.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import { sendVerificationEmail } from "../lib/resend.js";

const VERIFICATION_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export const signup = async (req, res) => {
  const { fullname, email, password } = req.body;
  try {
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS);

    await PendingSignup.deleteMany({ email });

    const pending = new PendingSignup({
      email,
      fullname,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpires,
    });
    await pending.save();

    const frontendUrl = (process.env.FRONTEND_URL || "").replace(/\/$/, "");
    if (!frontendUrl) {
      await PendingSignup.findByIdAndDelete(pending._id);
      console.error("Signup: FRONTEND_URL is not set");
      return res.status(500).json({ message: "Server misconfiguration. Please try again later." });
    }

    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
    const { error: emailError } = await sendVerificationEmail(email, verificationUrl);

    if (emailError) {
      await PendingSignup.findByIdAndDelete(pending._id);
      console.error("Signup: verification email could not be sent to", email, emailError?.message || emailError);
      return res.status(503).json({
        message: "We couldn't send the verification email. Please check your email address and try again.",
      });
    }

    res.status(201).json({
      message: "Check your email to verify and complete your account. The link expires in 1 hour.",
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.isVerified === false) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
      });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.query;
  try {
    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Invalid or missing verification token." });
    }

    const pending = await PendingSignup.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!pending) {
      return res.status(400).json({
        message: "Invalid or expired verification link. Please sign up again to get a new link.",
      });
    }

    const existingUser = await User.findOne({ email: pending.email });
    if (existingUser) {
      await PendingSignup.findByIdAndDelete(pending._id);
      return res.status(400).json({ message: "This email is already registered. Please log in." });
    }

    const newUser = new User({
      fullname: pending.fullname,
      email: pending.email,
      password: pending.password,
      isVerified: true,
    });
    await newUser.save();

    await PendingSignup.findByIdAndDelete(pending._id);

    generateToken(newUser._id, res);

    res.status(200).json({
      message: "Email verified. Your account is ready.",
      user: {
        _id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
        profilePic: newUser.profilePic,
      },
    });
  } catch (error) {
    console.log("Error in verifyEmail controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
