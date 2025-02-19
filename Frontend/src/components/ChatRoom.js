import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { useParams } from "react-router-dom";

function ChatRoom() {
  const { roomID } = useParams(); // Get room ID from URL
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const socketRef = useRef(null); // Store socket instance in useRef

  // Retrieve username from local storage once when the component mounts
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    console.log("Stored Username:", storedUsername);
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []); // Empty dependency array ensures it runs only on mount

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:3000"); // Initialize socket connection
    }

    const socket = socketRef.current;

    socket.emit("join_room", roomID);

    socket.on("room_messages", (messages) => {
      setMessages(messages);
    });

    socket.on("receive_message", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.emit("leave_room", roomID);
      socket.disconnect(); // Ensure socket disconnects on unmount
      socketRef.current = null; // Reset socket reference
    };
  }, [roomID]);

  
    const sendMessage = () => {
      if (newMessage.trim()) {
        socketRef.current.emit("send_message", { roomID, username, message: newMessage });
        setNewMessage(""); // Clear input after sending
      }
    };
    

  return (
    <div className="chat-room">
      <h2>Room: {roomID}</h2>
      <h3>Welcome, {username ? username : "Guest"}</h3>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.username}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <div className="send-message">
        <input
          type="text"
          placeholder="Type your message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatRoom;


