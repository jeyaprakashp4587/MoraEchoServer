const mongoose = require("mongoose");
const { DB1 } = require("../DB/DB1");

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
  person: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = DB1.model("User", userSchema);
