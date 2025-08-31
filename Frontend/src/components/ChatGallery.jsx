import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/ChatGallery.module.css";
import  ChatNavbar  from "./ChatNavbar";


const HOST = window.location.hostname;
const BACKEND_URI = (HOST === "localhost") ? "localhost:3000" : HOST;

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
      const refreshToken = localStorage.getItem("RefreshToken"); // Retrieve fresh token
      const response = await axios.post(
        `http://${BACKEND_URI}/api/refresh-token`,
        { refreshToken, username }


      );

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
        `http://${BACKEND_URI}/api/fetch-user-rooms`,
        { username },
        { headers: { Authorization: `Bearer ${AccessToken}` } }
      );

      setChats(Array.isArray(response.data.rooms) ? response.data.rooms : []);
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data;

        if (status === 401) {
          console.error("Forbidden:", errorMessage);
          alert("Access Denied: " + errorMessage);
          // window.location.href = "/";
        } else if (status === 403) {
          console.error("Unauthorized: Token expired or invalid");
          const newToken = await RefreshTokenFunction();
          if (newToken) GetChats(); // Retry after refreshing token
          else alert("Session expired. Please log in again.");
          // window.location.href = "/";
        } else {
          console.error("Error fetching chats:", errorMessage);
        }
      } else {
        console.error("Network error:", error.message);
      }
    }
  };

  const CreateUniqueID = async () => {
    const uniqueID = Math.random().toString(36).substr(2, 9);
    setRoomID(uniqueID);

    try {
      const AccessToken = localStorage.getItem("AccessToken");
      await axios.post(`http://${BACKEND_URI}/api/chat/create`, { roomID: uniqueID, username }, {
        headers: { Authorization: `Bearer ${AccessToken}` }
      });
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data;

        if (status === 401) {
          console.error("Forbidden:", errorMessage);
          alert("Access Denied: " + errorMessage);
          // window.location.href = "/";
        } else if (status === 403) {
          console.error("Unauthorized: Token expired or invalid");
          const newToken = await RefreshTokenFunction();
          if (newToken) CreateUniqueID(); // Retry after refreshing token
          else alert("Session expired. Please log in again.");
          // window.location.href = "/";
        } else {
          console.error("Error creating room:", errorMessage);
          alert("Room creation failed, please try again!");
        }
      } else {
        console.error("Network error:", error.message);
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
      await axios.post(
        `http://${BACKEND_URI}/api/chat/join`,
        { roomID, username },
        {
          headers: {
            "Authorization": `Bearer ${AccessToken}`
          }
        }
      );

      navigate(`/chat/${roomID}`);

      GetChats();
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data;

        if (status === 403) {
          console.error("Forbidden:", errorMessage);
          alert("Access Denied: " + errorMessage);
          // window.location.href = "/";
        } else if (status === 401) {
          console.error("Unauthorized: Token expired or invalid");
          const newToken = await RefreshTokenFunction();
          if (newToken) JoinRoom();
          else alert("Session expired. Please log in again.");
          // window.location.href = "/";
        } else {
          console.error("Error joining room:", errorMessage);
          alert("Failed to join the room, please try again!");
        }
      } else {
        console.error("Network error:", error.message);
      }
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('username');
    localStorage.removeItem('RefreshToken');
    localStorage.removeItem('AccessToken');
    localStorage.removeItem('RefreshToken');
    localStorage.removeItem('PublicKey')
    navigate("/");
  }

  return (
    <div className={styles.chatGallery}>
      {<ChatNavbar/>}
      <div className={styles.heading}>Welcome, {username || "Guest"}!</div>
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
          <button
            className={styles.joinBtn}
            onClick={() => {
              JoinRoom(); // Call JoinRoom function
              if (roomID) {
                onSelectChat({ roomID }); // Call onSelectChat with the roomID
              }
            }}
          >
            Join a Room</button>
        </div>
        <h3 className={styles.subHeading}>Your Chats</h3>
        <div className={styles.chatList}>
          {chats.length > 0 ? (
            chats.map((chat) => (
              <Link
                to={`/chat/${chat.roomID}?roomName=${chat.roomName}`}
                className={styles.chatLink}
                onClick={() => onSelectChat(chat)}
              >
                <div key={chat.roomID} className={styles.chatRoom}>
                  {chat.roomName ? `Room: ${chat.roomName}` : `Room ID: ${chat.roomID}`}
                  <p className={styles.users}>{chat.users.join(", ")}</p>
                </div>
              </Link>
            ))
          ) : (
            <p className={styles.noChats}>No chats available</p>
          )}
        </div>
      </div>

      <div className={styles.Logout}>
        <button className={styles.LogoutBtn} onClick={handleLogout}> Logout</button>
      </div>
    </div>

  );
}

export default ChatGallery;
