import express from "express";
import cors from "cors";
import http from "http";
const app = express();
import initializeSocket from "./Sockets/Socket.js";
import DB1 from "./DB/DB1.js";
import PersonRoutes from "./Router/personRoutes.js";
import authRoutes from "./Router/authRoutes.js";
import bodyParser from "body-parser";
import chatRoutes from "./Router/chatRoutes.js";
import coinsRoutes from "./Router/coinsRoutes.js";
import { connectRedis } from "./Redis/redis.js";

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
const server = http.createServer(app);
// start socket server -
initializeSocket(server);
// connect redid
(async () => {
  await connectRedis();
  // generateReferralCode();
})();
// on DBs
app.use("/person", PersonRoutes);
app.use("/chat", chatRoutes);
app.use("/auth", authRoutes);
app.use("/coins", coinsRoutes);
DB1.on("connected", () => {
  console.log("DB1 is connected");
});
app.get("/get", (req, res) => {
  console.log("server alive");
  res.send("Server is alivfkdkgfdge");
});
const port = process.env.port || 8080;
server.listen(port, () => console.log(`Server is listening on port ${port}`));
// https://res.cloudinary.com/dogo7hkhy/video/upload/v1761031419/thanks-for-watching-male-relatable-voice-222995_emccch.mp3
