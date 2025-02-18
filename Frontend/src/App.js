import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ChatGallery from "./components/ChatGallery";
import ChatRoom from "./components/ChatRoom"; // Import the ChatRoom component

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/chat-gallery" element={<ChatGallery />} />
          <Route path="/chat/:roomID" element={<ChatRoom />} /> {/* Add route for the chat room */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
