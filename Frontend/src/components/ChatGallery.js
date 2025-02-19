import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function ChatGallery() {
  const [chats, setChats] = useState({}); // Store rooms as an object
  const [roomID, setRoomID] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    console.log("Stored Username:", storedUsername);
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    if (username) {
      GetChats();
    }
  }, [username]);

  const GetChats = async () => {
    try {
      console.log("Fetching chats for:", username);
      const response = await axios.post(
        "http://localhost:3000/api/fetch-user-rooms",
        { username },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Response Data:", response.data);

      // Ensure response contains 'rooms'
      if (response.data.rooms && typeof response.data.rooms === "object") {
        setChats(response.data.rooms); // Store rooms directly as an object
      } else {
        setChats({});
      }

    } catch (error) {
      console.error("Error fetching chats:", error.response?.data || error.message);
    }
  };

  const CreateUniqueID = async () => {
    const uniqueID = Math.random().toString(36).substr(2, 9);
    setRoomID(uniqueID);

    try {
      await axios.post("http://localhost:3000/api/chat/create", {
        roomID: uniqueID,
        username,
      });
      console.log("Room created successfully:", uniqueID);
    } catch (error) {
      console.error("Error during room creation:", error);
      alert("Room creation failed, please try again!");
    }
  };

  const JoinRoom = async () => {
    if (!roomID) {
      alert("Please enter a room ID to join.");
      return;
    }
    try {
      await axios.post("http://localhost:3000/api/chat/join", {
        roomID,
        username,
      });
      console.log("Joined room successfully:", roomID);
      navigate(`/chat/${roomID}`);
    } catch (error) {
      console.error("Error joining room:", error);
      alert("Failed to join the room, please try again!");
    }
  };

  return (
    <div className="chat-gallery">
    <h2>Welcome, {username || "Guest"}!</h2>

    <button onClick={CreateUniqueID}>Create a Chat Room</button>

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
      <button onClick={JoinRoom}>Join a Room</button>
    </div>

      <h3>Your Chats</h3>
      <div>
      {Object.keys(chats).length > 0 ? (
  Object.entries(chats).map(([roomId, users]) => 
    users.length > 1 && (
      <div key={roomId} className="chat-room">
        <Link to={`/chat/${roomId}`}><strong>Room ID: {roomId}</strong></Link>
        <p>Users: {users.join(", ")}</p>
      </div>
    )
  )
) : (
  <p>No active chats available</p>
)}

      </div>
    </div>
  );
}

export default ChatGallery;

