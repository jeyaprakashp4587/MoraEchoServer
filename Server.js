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

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
const server = http.createServer(app);
// start socket server -
initializeSocket(server);
// on DBs
app.use("/Person", PersonRoutes);
app.use("/Chat", chatRoutes);
app.use("/Auth", authRoutes);
DB1.on("connected", () => {
  console.log("DB1 is connected");
});
app.get("/", () => console.log("server alive"));
const port = process.env.port || 8080;
server.listen(port, () => console.log(`Server is listening on port ${port}`));
// https://res.cloudinary.com/dogo7hkhy/video/upload/v1761031419/thanks-for-watching-male-relatable-voice-222995_emccch.mp3
