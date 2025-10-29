import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.model";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID as string);

// ===================
// Local Sign Up
// ===================
export const signup = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, userType } = req.body;

    console.log('Signup attempt:', { firstName, lastName, email, userType });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      userType,
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
    res.status(201).json({ user: newUser, token });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// ===================
// Local Sign In
// ===================
export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
    res.status(200).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// ===================
// Google Sign Up
// ===================
export const googleSignup = async (req: Request, res: Response) => {
  try {
    const { tokenId, userType } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload) return res.status(400).json({ message: "Invalid Google token" });

    const { email, given_name, family_name } = payload;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    user = await User.create({
      firstName: given_name,
      lastName: family_name,
      email,
      userType,
      password: "", // no password needed for Google accounts
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// ===================
// Google Sign In
// ===================
export const googleSignin = async (req: Request, res: Response) => {
  try {
    const { tokenId } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload) return res.status(400).json({ message: "Invalid Google token" });

    const { email } = payload;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found, please sign up first" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
    res.status(200).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};
