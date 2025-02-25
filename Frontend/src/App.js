import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
// import ChatGallery from "./components/ChatGallery";
// import ChatRoom from "./components/ChatRoom";
import ChatLayout from "./components/ChatLayout";

function App() {
  
  return (
    <Router>
      
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* <Route path="/chat-gallery" element={<ChatGallery />} />
            <Route path="/chat/:roomID" element={<ChatRoom />} /> */}
             <Route path="/chat-gallery" element={<ChatLayout />} />
             <Route path="/chat/:roomID" element={<ChatLayout />} />

          </Routes>
      
      
    </Router>
  );
}

export default App;

