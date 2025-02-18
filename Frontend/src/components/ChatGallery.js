import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import io from "socket.io-client";

function ChatGallery() {
  const [chats, setChats] = useState([]);
  const [roomID, setRoomID] = useState("");
  const [username, setUsername] = useState(""); // Add state for username
  const navigate = useNavigate();
  const socket = io("http://localhost:3000");  // Connect to the server

  // Get the username from localStorage (or replace with context if needed)
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    console.log("Stored Username:", storedUsername); // Debugging to see if it gets the correct username
    if (storedUsername) {
      setUsername(storedUsername); // Set username if available
    }

    // Fetch existing chat rooms (if needed)
    // axios.get("http://localhost:3000/api/chat").then((response) => {
    //   setChats(response.data);
    // });
    
  }, []);

  // Create a unique ID and send it to the backend
  const CreateUniqueID = () => {
    const uniqueID = Math.random().toString(36).substr(2, 9);
    setRoomID(uniqueID); // Set the generated ID without alerting

    // Send the unique room ID to the backend to create a room
    axios.post("http://localhost:3000/api/chat/create", { roomID: uniqueID, username })
      .then((response) => {
        console.log("Room created:", response.data);
      })
      .catch((error) => {
        console.error("Error creating room:", error);
      });
  };

  // Join a room using the provided room ID
  const JoinRoom = () => {
    if (roomID) {
      socket.emit("join_room", roomID);  // Emit join room event
      navigate(`/chat/${roomID}`);  // Navigate to the chat room
    } else {
      alert("Please enter a room ID to join.");
    }
  };
  

  return (
    <div className="chat-gallery">
      <h2>Welcome, {username ? username : "Guest"}!</h2> {/* Display username */}
      
      <h3>Your Chats</h3>
      <button onClick={CreateUniqueID}>Create a chat room</button>

      {roomID && (
        <div>
          <p>Your Room ID: <strong>{roomID}</strong></p> {/* Display generated Room ID */}
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
