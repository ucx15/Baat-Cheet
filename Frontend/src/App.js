import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ChatGallery from "./components/ChatGallery";
import ChatRoom from "./components/ChatRoom";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setTimeout(() => setShowSplash(false), 5000); // Hide splash after 3s
  }, []);

  return (
    <Router>
      <div className="App">
        {showSplash ? (
          <SplashScreen />
        ) : (
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/chat-gallery" element={<ChatGallery />} />
            <Route path="/chat/:roomID" element={<ChatRoom />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
