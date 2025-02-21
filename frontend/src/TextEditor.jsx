import { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

function TextEditor() {
  const { id: docID } = useParams();
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();

  console.log(docID);

  const SAVE_INTERVAL_MS = 2000;

  useEffect(() => {
    if (socket == null || quill == null) return;

    socket.once("load-document", (doc) => {
      quill.setContents(doc);
      quill.enable();
    });

    socket.emit("get-document", docID);
  }, [socket, quill, docID]);

  useEffect(() => {
    const s = io("http://localhost:3000");
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta) => {
      quill.updateContents(delta);
    };

    socket.on("receive-changes", handler);

    return () => {
      socket.off("receive-changes", handler);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };

    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [socket, quill]);

  const toolbarOptions = [
    ["bold", "italic", "underline"],
    ["code-block"],
    ["link", "image"],

    [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],

    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    [{ color: [] }],
    [{ font: [] }],
    [{ align: [] }],

    ["clean"], // remove formatting button
  ];

  // callback function for setting quill editor
  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;

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

  return <div className="container" ref={wrapperRef}></div>;
}

export default TextEditor;
