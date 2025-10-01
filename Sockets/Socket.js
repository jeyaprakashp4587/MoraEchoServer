const Socket = require("socket.io");

const initializeScoket = (server) => {
  const io = Socket(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });
  // connet the socket
  io.on("connect", async (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("fd");
    console.log("socket connected sucessfully");
  });
};

module.exports = initializeScoket;
