import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Quill from "quill";
import { io } from "socket.io-client";
import "quill/dist/quill.snow.css";

function TextEditor() {
  const { id: docID } = useParams();
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();

  console.log(docID);

  const SAVE_INTERVAL_MS = 1000;

  // enable socket locally
  useEffect(() => {
    const serverURL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
    const s = io(serverURL);
    setSocket(s);

    return () => s.disconnect();
  }, []);

  // Handle socket and quill related events
  useEffect(() => {
    if (!socket || !quill) return; // if not yet loaded

    // load doc contents and enable editing
    socket.once("load-document", (doc) => {
      quill.setContents(doc);
      quill.enable();
    });

    // get doc using ID, or create one
    socket.emit("get-document", docID);

    // fetch updated doc changes from quill
    const receiveChanges = (delta) => quill.updateContents(delta);
    // send new doc changes to socket
    const sendChanges = (delta, oldDelta, source) => {
      if (source === "user") socket.emit("send-changes", delta);
    };

    socket.on("receive-changes", receiveChanges);
    quill.on("text-change", sendChanges);

    // Auto-save document at intervals
    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, SAVE_INTERVAL_MS);

    // clear all events and intervals
    return () => {
      socket.off("receive-changes", receiveChanges);
      quill.off("text-change", sendChanges);
      clearInterval(interval);
    };
  }, [socket, quill, docID]);

  // callback function for setting quill editor
  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;

    const toolbarOptions = [
      ["bold", "italic", "underline"],
      ["code-block"],
      ["link", "image"],

      [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],

      [{ header: [1, 2, 3, false] }],

      [{ color: [] }],
      [{ align: [] }],

      ["clean"], // remove formatting button
    ];

    wrapper.innerHTML = "";

    const editor = document.createElement("div");
    wrapper.append(editor);

    const q = new Quill(editor, {
      theme: "snow",
      modules: {
        toolbar: toolbarOptions,
      },
    });

    q.disable();
    q.setText("Loading");

    setQuill(q);
  }, []);

  return <section><div className="container" ref={wrapperRef}></div>
    <div className="">
      
    </div>
  </section>;
}

export default TextEditor;
