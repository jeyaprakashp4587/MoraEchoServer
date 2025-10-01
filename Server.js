const express = require("express");
const cors = require("cors");
const http = require("http");
const app = express();
const initializeSocket = require("./Sockets/Socket");
const { DB1 } = require("./DB/DB1");

app.use(cors({ origin: "*" }));
const server = http.createServer(app);
// start socket server -
initializeSocket(server);
// on DBs
DB1.on("connected", () => {
  console.log("DB1 is connected");
});
const port = process.env.port || 8080;
server.listen(port, () => console.log(`Server is listening on port ${port}`));
