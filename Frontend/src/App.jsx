import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ChatLayout from "./components/ChatLayout";

function App() {
  return (
    <Router>
      <MainContent />
    </Router>
  );
}

function MainContent() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/chat-gallery" element={<ChatLayout />} />
        <Route path="/chat/:roomID" element={<ChatLayout />} />
      </Routes>
    </>
  );
}

export default App;
