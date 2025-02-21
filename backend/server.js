import { Server } from "socket.io";
import mongoose from "mongoose";
import Document from "./document.js";

mongoose.connect("mongodb://localhost/collab_doc_editor").then(() => {
  console.log("mongoDB connected");
});

const io = new Server(3000, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const defaultValue = "";

io.on("connection", (socket) => {
  console.log("socket connected");

  socket.on("get-document", async (docID) => {
    const doc = await findOrCreateDoc(docID);
    socket.join(docID);
    socket.emit("load-document", doc.data);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(docID).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(docID, { data });
    });
  });
});

async function findOrCreateDoc(id) {
  if (id == null) return;

  const doc = await Document.findById(id);

  if (doc) return doc;

  return await Document.create({ _id: id, data: defaultValue });
}
