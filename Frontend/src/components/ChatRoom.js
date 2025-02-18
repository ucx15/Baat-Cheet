import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useParams } from "react-router-dom";

function ChatRoom() {
  const { roomID } = useParams(); // Get room ID from the URL
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socket = io("http://localhost:3000"); // Connect to the socket server

  useEffect(() => {
    // Fetch all previous messages for the room
    axios.get(`http://localhost:3000/api/messages/${roomID}`).then((response) => {
      setMessages(response.data);
    });

    socket.emit("join_room", roomID); // Emit join room event

    return () => {
      socket.emit("leave_room", roomID); // Emit leave room when component unmounts
    };
  }, [roomID]);

  const sendMessage = () => {
    if (newMessage) {
      socket.emit("send_message", { roomID, message: newMessage }); // Send the message to the server
      setMessages((prevMessages) => [
        ...prevMessages,
        { username: "You", message: newMessage }, // Add the message to the UI
      ]);
      setNewMessage(""); // Clear the input
    }
  };

  return (
    <div className="chat-room">
      <h2>Room: {roomID}</h2>
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

