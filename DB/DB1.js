import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const DbConfig = process.env.MONGO_URI;
const DB1 = mongoose.createConnection(DbConfig);
export default DB1;
