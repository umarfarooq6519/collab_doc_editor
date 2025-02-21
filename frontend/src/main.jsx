import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { v4 as uuidv4 } from "uuid";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./index.css";
import TextEditor from "./TextEditor.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={`/${uuidv4()}`} replace />} />
        <Route path="/:id" element={<TextEditor />} />
      </Routes>
    </Router>
  </StrictMode>
);
