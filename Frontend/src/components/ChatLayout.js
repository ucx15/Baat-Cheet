import React from "react";
import ChatGallery from "./ChatGallery";
import ChatRoom from "./ChatRoom";
// import styles from "..styles/ChatLayout.css";
import styles from "../styles/ChatLayout.css";

const ChatLayout = () => {
  return (
    <div className="chat-layout">
      <div className="left-panel">
        <ChatGallery />
      </div>
      <div className="right-panel">
        <ChatRoom />
      </div>
    </div>
  );
};

export default ChatLayout;
