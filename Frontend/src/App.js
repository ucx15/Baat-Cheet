import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ChatLayout from "./components/ChatLayout";
import ChatNavbar from "./components/ChatNavbar";

function App() {
  return (
    <Router>
      <MainContent />
    </Router>
  );
}

function MainContent() {
  const location = useLocation();

  // ChatNavbar sirf chat pages par dikhega
  const showNavbar = location.pathname.startsWith("/chat");

  return (
    <>
      {showNavbar && <ChatNavbar />}
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
