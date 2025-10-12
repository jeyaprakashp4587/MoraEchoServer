const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const DbConfig = process.env.MONGO_URI;
const DB1 = mongoose.createConnection(DbConfig);
module.exports = { DB1 };
