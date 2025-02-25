import React, { useState } from "react";
import ChatGallery from "./ChatGallery";
import ChatRoom from "./ChatRoom";
import "../styles/ChatLayout.css";

const ChatLayout = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="chat-layout">
      <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>
      <div className={`left-panel ${isOpen ? "open" : ""}`}>
        <ChatGallery />
      </div>
      <div className="right-panel">
        <ChatRoom />
      </div>
    </div>
  );
};

export default ChatLayout;
