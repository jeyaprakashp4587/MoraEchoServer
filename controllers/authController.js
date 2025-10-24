// const bcrypt = require("bcryptjs");
// const User = require("../models/User");
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import mongoose from "mongoose";
import { createAccessToken, createRefreshToken } from "../Middleware/JWT.js";
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    const accessToken = await createAccessToken(newUser._id);
    const refreshToken = await createRefreshToken(newUser._id);
    // console.log(newUser, accessToken, refreshToken);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
      tokens: { accessToken, refreshToken },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// login
export const login = async (req, res) => {
  const { email: Email, password: Password } = req.body;
  try {
    if (!Email || !Password) {
      return res
        .status(400)
        .json({ error: "Email and Password are required." });
    }

    const lowerCaseEmail = Email.toLowerCase().trim();

    const findEmailUser = await User.findOne({ email: lowerCaseEmail });

    if (!findEmailUser) {
      return res.status(401).json({ error: "Email or Password is incorrect." });
    }

    const isPasswordCorrect = await bcrypt.compare(
      Password,
      findEmailUser.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Email or Password is incorrect." });
    }
    const userData = findEmailUser.toObject();
    delete userData.password;
    const accessToken = await createAccessToken(userData._id);
    const refreshToken = await createRefreshToken(userData._id);
    console.log(accessToken);

    res.json({
      message: "SignIn Successful",
      user: userData,
      tokens: { accessToken, refreshToken },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// refresh token

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ msg: "No token provided" });

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decode) => {
        if (err) return res.status(403).json({ msg: "Invalid token" });
        const newAccessToken = createAccessToken(decode.userId);
        res.json({ accessToken: newAccessToken });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
