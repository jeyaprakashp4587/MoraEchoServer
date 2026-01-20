import mongoose from "mongoose";
import DB1 from "../DB/DB1.js";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  language: {
    type: String,
  },
  persons: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Persons",
    },
  ],
  referralCode: { type: String, unique: true },
  country: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  subscription: {
    planId: { type: String },
    basePlanId: { type: String },
    purchaseToken: { type: String },
    startDate: { type: Date },
    expiryDate: { type: Date },
    autoRenew: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "pending"],
      default: "pending",
    },
  },
});

export default DB1.model("User", userSchema);
