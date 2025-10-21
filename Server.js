const express = require("express");
const cors = require("cors");
const http = require("http");
const app = express();
const initializeSocket = require("./Sockets/Socket");
const { DB1 } = require("./DB/DB1");
const PersonRoutes = require("./Router/personRoutes");
const authRoutes = require("./Router/authRoutes");
const bodyParser = require("body-parser");
const chatRoutes = require("./Router/chatRoutes");

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
