import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import generateReferralCode from "../utils/generateReferralCode.js";

import { createAccessToken, createRefreshToken } from "../Middleware/JWT.js";
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, referralCode, country, language } = req.body;
    console.log(name, email, password, referralCode, country, language);
    // return;
    const existingUser = await User.exists({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // generate referralcode
    let code;
    do {
      code = generateReferralCode();
    } while (await User.exists({ referralCode: code }));
    //
    let findReferredUser;
    if (referralCode) {
      findReferredUser = await User.findOneAndUpdate(
        { referralCode: referralCode },
        { $inc: { amount: 5 } }
      );
      if (!findReferredUser) {
        return res.status(404).json({ error: "no referl user found" });
      }
    }
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      referralCode: code,
      country,
      language,
      amount: findReferredUser ? 15 : 10,
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
    res.status(500).json({ error: "Server error" });
  }
};
// login
export const login = async (req, res) => {
  const { email: Email, password: Password } = req.body;
  try {
    // return;
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

    res.json({
      message: "login successful",
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

    // Verify the refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET
    );

    // Create a new access token (await the async function)
    const newAccessToken = await createAccessToken(decoded.userId);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(403).json({ msg: "Invalid or expired refresh token" });
    }
    console.error("Refresh token error:", err);
    res.status(500).json({ error: err.message });
  }
};

// get User
export const getUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const userData = await User.findById(userId, { password: 0 });
    if (userData) {
      const accessToken = await createAccessToken(userData._id);
      const refreshToken = await createRefreshToken(userData._id);
      res
        .status(200)
        .json({ user: userData, tokens: { accessToken, refreshToken } });
    } else {
      res.status(404).json({ message: "user not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
