import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Quill from "quill";
import { io } from "socket.io-client";
import "quill/dist/quill.bubble.css";

function TextEditor() {
  const { id: docID } = useParams();
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();

  console.log(docID);

  const SAVE_INTERVAL_MS = 1000;

  // enable socket locally
  useEffect(() => {
    const serverURL =
      import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
    const s = io(serverURL);

    console.log(import.meta.env.VITE_SERVER_URL);
    setSocket(s);

    return () => s.disconnect();
  }, []);

  // Load the doc
  useEffect(() => {
    if (!socket || !quill) return;

    socket.once("load-document", (doc) => {
      quill.setContents(doc);
      quill.enable();
    });

    socket.emit("get-document", docID);
  }, [socket, quill, docID]);

  // Handle real-time updates
  useEffect(() => {
    if (!socket || !quill) return;

    const receiveChanges = (delta) => quill.updateContents(delta);
    const sendChanges = (delta, oldDelta, source) => {
      if (source === "user") socket.emit("send-changes", delta);
    };

    socket.on("receive-changes", receiveChanges);
    quill.on("text-change", sendChanges);

    return () => {
      socket.off("receive-changes", receiveChanges);
      quill.off("text-change", sendChanges);
    };
  }, [socket, quill]);

  // Auto-save doc at intervals
  useEffect(() => {
    if (!socket || !quill) return;

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, SAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [socket, quill]);

  // callback func for setting quill editor
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
      theme: "bubble",
      modules: {
        toolbar: toolbarOptions,
      },
    });

    q.disable();
    q.setText("Loading");

    setQuill(q);
  }, []);

  return (
    <section>
      <div className="top-bar">
        <div className="content">
          <div className="wrapper menu-wrapper">
            <img src="/icons/menu.svg" className="icon" alt="" />
          <h1>CollaDoc. </h1>
          </div>

          <div className="wrapper">
            <button className="share-btn">
              <img className="icon" src="/icons/share.svg" alt="" />
              <span>Share</span>
            </button>

            <div className="avatar">
              <img src="/avatars/avatartion.png" alt="User Avatar" />
            </div>
          </div>
        </div>
      </div>

      <div className="container" ref={wrapperRef}></div>
    </section>
  );
}

export default TextEditor;
