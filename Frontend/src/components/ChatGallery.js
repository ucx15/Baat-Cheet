import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import io from "socket.io-client";

function ChatGallery() {
  const [chats, setChats] = useState([]);
  const [roomID, setRoomID] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const socketRef = useRef(null); // useRef ensures a single connection

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:3000", { autoConnect: false }); // Prevent auto connection
    }
    const socket = socketRef.current;

    // Connect the socket manually only once
    if (!socket.connected) {
      socket.connect();
    }

    const storedUsername = sessionStorage.getItem("username");
    console.log("Stored Username:", storedUsername);
    if (storedUsername) {
      setUsername(storedUsername);
    }

    return () => {
      socket.disconnect(); // Disconnect on component unmount
      socketRef.current = null;
    };
  }, []);

  const CreateUniqueID = () => {
    const uniqueID = Math.random().toString(36).substr(2, 9);
    setRoomID(uniqueID);
    socketRef.current.emit("join_room", uniqueID);
    console.log("Room created:", uniqueID);
  };

  const JoinRoom = () => {
    if (roomID) {
      socketRef.current.emit("join_room", roomID);
      navigate(`/chat/${roomID}`);
    } else {
      alert("Please enter a room ID to join.");
    }
  };

  return (
    <div className="chat-gallery">
      <h2>Welcome, {username ? username : "Guest"}!</h2>
      <h3>Your Chats</h3>
      <button onClick={CreateUniqueID}>Create a chat room</button>

      {roomID && (
        <div>
          <p>Your Room ID: <strong>{roomID}</strong></p>
        </div>
      )}

      <div>
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomID}
          onChange={(e) => setRoomID(e.target.value)}
        />
        <button onClick={JoinRoom}>Join a room</button>
      </div>

      <div>
        {chats.map((chat) => (
          <div key={chat.id}>
            <Link to={`/chat/${chat.id}`}>{chat.name}</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatGallery;
