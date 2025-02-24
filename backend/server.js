import dotenv from "dotenv";
import { Server } from "socket.io";
import express from "express";
import http from "http";
import cors from "cors";
import Document from "./doc.model.js";
import { connectDB } from "./db.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:4173";

connectDB(MONGO_URI);

// Initialize Express and HTTP Server
const app = express();
const server = http.createServer(app);

app.use(cors({ origin: CLIENT_URL, methods: ["GET", "POST"] }));

console.log(CLIENT_URL);


// Establish Socket.io connection
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL, // Allow frontend URL
    methods: ["GET", "POST"],
  },
});

// handling socket events
io.on("connection", (socket) => {
  console.log("Socket connected");

  // Find or create doc using docID
  socket.on("get-document", async (docID) => {
    const doc = await findOrCreateDoc(docID);
    socket.join(docID);
    socket.emit("load-document", doc.data);

    // Send and receive doc changes
    socket.on("send-changes", (delta) => {
      socket.broadcast.to(docID).emit("receive-changes", delta);
    });

    // Save doc after interval
    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(docID, { data });
    });
  });
});


async function findOrCreateDoc(docID) {
  if (!docID) return;

  const doc = await Document.findById(docID);
  return doc || (await Document.create({ _id: docID, data: "" }));
}

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
