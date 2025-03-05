import React, { useState } from "react";
import ChatGallery from "./ChatGallery";
import ChatRoom from "./ChatRoom";
import "../styles/ChatLayout.css";

const ChatLayout = () => {

  const [isOpen, setIsOpen] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setIsOpen(false); // Close the menu when a chat is clicked
  };

  return (

    <div className="chat-layout">

      <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>

        <div className={`left-panel ${isOpen ? "open" : ""}`}>
          <ChatGallery onSelectChat={handleChatSelect} />
        </div>

        <div className="right-panel">
          <ChatRoom chat={selectedChat} />
        </div>

    </div>
  );
};

export default ChatLayout;
