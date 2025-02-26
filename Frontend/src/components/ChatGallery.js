import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/ChatGallery.module.css";

function ChatGallery({ onSelectChat }) {
  const [chats, setChats] = useState([]);
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

  

  const RefreshTokenFunction = async () => {
    try {
      const refreshToken = localStorage.getItem("RefreshToken");
      const response = await axios.post("http://localhost:3000/api/refresh-token", { refreshToken });
      const newAccessToken = response.data.accessToken;
      localStorage.setItem("AccessToken", newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error("Error refreshing token:", error.response?.data || error.message);
      return null;
    }
  };

  const GetChats = async () => {
    try {
      const AccessToken = localStorage.getItem("AccessToken");
      const response = await axios.post(
        "http://localhost:3000/api/fetch-user-rooms",
        { username },
        { headers: { Authorization: `Bearer ${AccessToken}` } }
      );
      setChats(Array.isArray(response.data.rooms) ? response.data.rooms : []);
    } catch (error) {
      if (error.response?.status === 403) {
        const newToken = await RefreshTokenFunction();
        if (newToken) GetChats();
      }
    }
  };

  const CreateUniqueID = async () => {
    const uniqueID = Math.random().toString(36).substr(2, 9);
    setRoomID(uniqueID);
    try {
      const AccessToken = localStorage.getItem("AccessToken");
      await axios.post("http://localhost:3000/api/chat/create", { roomID: uniqueID, username }, {
        headers: { Authorization: `Bearer ${AccessToken}` }
      });
    } catch (error) {
      if (error.response?.status === 403) {
        const newToken = await RefreshTokenFunction();
        if (newToken) CreateUniqueID();
      }
    }
  };

  const JoinRoom = async () => {
    if (!roomID) {
      alert("Please enter a room ID to join.");
      return;
    }
    try {
      const AccessToken = localStorage.getItem("AccessToken");
      await axios.post("http://localhost:3000/api/chat/join", { roomID, username }, {
        headers: { Authorization: `Bearer ${AccessToken}` }
      });
      navigate(`/chat/${roomID}`);
      GetChats();
    } catch (error) {
      if (error.response?.status === 403) {
        const newToken = await RefreshTokenFunction();
        if (newToken) JoinRoom();
      }
    }
  };

  return (
    <div className={styles.chatGallery}>
      <h2 className={styles.heading}>Welcome, {username || "Guest"}!</h2>
      <div className={styles.menu}>
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
          <button className={styles.joinBtn} onClick={JoinRoom}>Join a Room</button>
        </div>
        <h3 className={styles.subHeading}>Your Chats</h3>
        <div className={styles.chatList}>
          {chats.length > 0 ? (
            chats.map((chat) => (
              <div key={chat.roomID} className={styles.chatRoom}>
                <Link
                  to={`/chat/${chat.roomID}?roomName=${chat.roomName}`}
                  className={styles.chatLink}
                  onClick={() => onSelectChat(chat)}
                >
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
    </div>
  );
}

export default ChatGallery;
