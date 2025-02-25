import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/ChatGallery.module.css"; // Import CSS Module

function ChatGallery() {
  const [chats, setChats] = useState([]); // Store rooms as an array
  const [roomID, setRoomID] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
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
      const response = await axios.post(
        "http://localhost:3000/api/fetch-user-rooms",
        { username },
        { headers: { "Content-Type": "application/json" } }
      );
      if (Array.isArray(response.data.rooms)) {
        setChats(response.data.rooms);
      } else {
        setChats([]);
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
    } catch (error) {
      console.error("Error creating room:", error);
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
      navigate(`/chat/${roomID}`);
      GetChats();
    } catch (error) {
      console.error("Error joining room:", error);
      alert("Failed to join the room, please try again!");
    }
  };

  return (
    <div className={styles.chatGallery}>
      <h2 className={styles.heading}>Welcome, {username || "Guest"}!</h2>

      <button className={styles.createBtn} onClick={CreateUniqueID}>
        Create a Chat Room
      </button>

      {roomID && <p className={styles.roomID}>Your Room ID: <strong>{roomID}</strong></p>}

      <div className={styles.joinRoom}>
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomID}
          onChange={(e) => setRoomID(e.target.value)}
          className={styles.inputField}
        />
        <button className={styles.joinBtn} onClick={JoinRoom}>
          Join a Room
        </button>
      </div>

      <h3 className={styles.subHeading}>Your Chats</h3>
      <div className={styles.chatList}>
        {chats.length > 0 ? (
          chats.map((chat) => (
            <div key={chat.roomID} className={styles.chatRoom}>
              <Link to={`/chat/${chat.roomID}?roomName=${chat.roomName}`} className={styles.chatLink}>
                {chat.roomName ? `Room: ${chat.roomName}` : `Room ID: ${chat.roomID}`}
              </Link>
              <p className={styles.users}>{chat.users.join(", ")}</p>
            </div>
          ))
        ) : (
          <p className={styles.noChats}>No chats available</p>
        )}
      </div>
    </div>
  );
}

export default ChatGallery;
