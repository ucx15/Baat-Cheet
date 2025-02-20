import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
// import io from "socket.io-client";

function ChatGallery() {
  const [chats, setChats] = useState([]);
  const [roomID, setRoomID] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  // const socketRef = useRef(null); // useRef ensures a single connection

  useEffect(() => {
    // if (!socketRef.current) {
    //   socketRef.current = io("http://localhost:3000", { autoConnect: false }); // Prevent auto connection
    // }
    // const socket = socketRef.current;

    // Connect the socket manually only once
    // if (!socket.connected) {
    //   socket.connect();
    // }

    const storedUsername = localStorage.getItem("username");
    console.log("Stored Username:", storedUsername);
    setUsername(storedUsername);
    
    // if (storedUsername) {
    // setUsername(storedUsername);
    // }

    // return () => {
    //   socket.disconnect(); // Disconnect on component unmount
    //   socketRef.current = null;
    // };
  }, []);

  
   
  const CreateUniqueID = async () => {
   const uniqueID = Math.random().toString(36).substr(2, 9);
   setRoomID(uniqueID);

  
    try{
    const response = await axios.post("http://localhost:3000/api/chat/create", {
      roomID: uniqueID, 
      username: username,
    });
    console.log("Room created successfully:", roomID);
  }

  catch (error) {
    console.error("Error during sending uniqueId to backend:", error);
    alert("Signup failed, please try again!"); // Handle errors
  }
  
    // socketRef.current.emit("join_room", uniqueID);
    console.log("Room created:", roomID);
  };

  const JoinRoom = async () => {

    if (true) {
      try{
        const response = await axios.post("http://localhost:3000/api/chat/join", {
          roomID:  roomID, 
          username: username,
        });
        console.log("sent successfully");   
      }
      catch (error) {
        console.error("Error during sending uniqueId to backend:", error);
        alert("Signup failed, please try again!"); // Handle errors
      }
      
      // socketRef.current.emit("join_room", roomID);
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
