import jwt from "jsonwebtoken";
import dotEnv from "dotenv";
import User from "../models/User.js";
dotEnv.config();

const verifyPremium = async (req, res, next) => {
  const userId = req.userId;

  if (!userId) return res.status(401).json({ msg: "No user ID provided" });

  try {
    const user = await User.findById(userId).select("isPremium");
    if (!user) return res.status(404).json({ msg: "User not found" });
    if (!user.isPremium) {
      return res
        .status(403)
        .json({ msg: "Access denied. Premium membership required." });
    }
    next();
  } catch (err) {
    return res.status(403).json({ msg: "Invalid or expired token" });
  }
};

export default verifyPremium;
