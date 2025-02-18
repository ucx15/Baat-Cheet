import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ChatGallery from "./components/ChatGallery";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/chat-gallery" element={<ChatGallery />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
