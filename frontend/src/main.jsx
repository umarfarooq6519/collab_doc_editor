import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { v4 as uuidv4 } from "uuid";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import TextEditor from "./TextEditor.jsx";
import "./index.css";


// VITE_SERVER_URL and CLIENT_URL

// TODO:
// Implement mongoDB atlas ✅
// Host the project ✅
// Implement MUI sidebar and responsive
// Implement auth
// Implement AI feature

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
