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
  amount: {
    type: Number,
    default: 100,
  },
  country: {
    type: String,
  },
  goals: [
    {
      goalTitle: String,
      goalStreak: {
        type: Number,
        default: 0,
      },
      goalTodos: [
        {
          todoName: String,
          completed: {
            type: Boolean,
            default: false,
          },
        },
      ],
      isToday: {
        type: Boolean,
        default: false,
      },
      lastCheckedDate: {
        type: String,
        default: null,
      },
      streakRewardPending: {
        type: Boolean,
        default: false,
      },
      completionHistory: [
        {
          date: String,
          completed: Boolean,
        },
      ],
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default DB1.model("User", userSchema);
