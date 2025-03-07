import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Quill from "quill";
import { io } from "socket.io-client";
import "quill/dist/quill.bubble.css";

function TextEditor() {
  const { id: docID } = useParams();
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();

  const [sidebar, setSidebar] = useState(false);

  const [docs, setDocs] = useState([]);

  const [copyState, setCopyState] = useState(false);

  const avatars = [
    "/avatars/avatartion.png",
    "/avatars/avatartion(1).png",
    "/avatars/avatartion(2).png",
    "/avatars/avatartion(5).png",
    "/avatars/avatartion(7).png",
    "/avatars/avatartion(8).png",
    "/avatars/avatartion(9).png",
    "/avatars/avatartion(11).png",
    "/avatars/avatartion(12).png",
    "/avatars/avatartion(13).png",
  ];

  const [avatar, setAvatar] = useState(avatars[0]);

  const SAVE_INTERVAL_MS = 1000;

  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const SERVER_DEV = "http://localhost:3000";

  // enable socket locally
  useEffect(() => {
    const serverURL = SERVER_URL || SERVER_DEV;
    const s = io(serverURL);

    console.log(SERVER_URL || `Server: ${SERVER_DEV}`);
    setSocket(s);

    return () => s.disconnect();
  }, [SERVER_URL]);

  // Load the doc
  useEffect(() => {
    if (!socket || !quill) return;

    socket.once("load-document", (doc) => {
      quill.setContents(doc);
      quill.enable();
    });

    socket.emit("get-document", docID);
  }, [socket, quill, docID]);

  // get docs list
  useEffect(() => {
    const getDocs = async () => {
      try {
        const response = await fetch(`${SERVER_URL || SERVER_DEV}/api/docs`);
        const data = await response.json();

        const sortedData = data.sort((a, b) => b._id.localeCompare(a._id));
        setDocs(sortedData);
      } catch (e) {
        console.error("Error fetching documents:", e);
      }
    };

    getDocs();
  }, [sidebar, SERVER_URL]);

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

  const randomizeAvatar = () => {
    const randomIndex = Math.floor(Math.random() * avatars.length);
    setAvatar(avatars[randomIndex]);
  };

  const saveToClipboard = async () => {
    setCopyState(true);
    await navigator.clipboard.writeText(docID);

    setTimeout(() => {
      setCopyState(false);
    }, 1500);
  };

  return (
    <section>
      <div className="top-bar">
        <div className="content">
          <div className="wrapper menu-wrapper">
            <span className="menu-btn" onClick={() => setSidebar(!sidebar)}>
              <img src="/icons/menu.svg" className="icon" alt="" />
            </span>

            <h1 className="title-name">CollaDoc. </h1>
          </div>

          <div className="wrapper">
            <button onClick={saveToClipboard} className="share-btn">
              <img
                className="icon"
                src={copyState ? "/icons/check.svg" : "/icons/share.svg"}
                alt=""
              />
              <span>{copyState ? "Copied" : "Copy ID"}</span>
            </button>

            <div onClick={randomizeAvatar} className="avatar">
              <img src={avatar} alt="User Avatar" />
            </div>
          </div>
        </div>
      </div>

      <div className="container" ref={wrapperRef}></div>

      {sidebar ? Sidebar() : null}
    </section>
  );

  function Sidebar() {
    return (
      <div className="sidebar">
        <div className="sidebar-container">
          <div className="sidebar-header">
            <h1 className="title-name">Recent Documents </h1>

            <span
              className="sidebar-cross-btn"
              onClick={() => setSidebar(!sidebar)}
            >
              <img
                src="/icons/cross.svg"
                className="icon sidebar-cross-icon"
                alt=""
              />
            </span>
          </div>

          <div className="sidebar-content">
            <ul className="recent-docs">
              {docs.map((doc) => (
                <li
                  onClick={() => (window.location.href = `/${doc._id}`)}
                  key={doc._id}
                  className={docID == doc._id ? "current-doc" : null}
                >
                  {doc._id} {docID == doc._id ? "(Current)" : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default TextEditor;
