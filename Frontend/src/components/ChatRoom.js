import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import "../styles/ChatRoom.css";

const HOST = window.location.hostname;
const BACKEND_URI = (HOST === "localhost") ? "localhost:3000" : HOST; 

function ChatRoom() {
  const { roomID } = useParams();
  const queryParams = new URLSearchParams(window.location.search);
  const initialRoomName = queryParams.get("roomName") || "";

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [editRoomId, seteditRoomId] = useState("");
  const [IsEditing, setIsEditing] = useState(false);
  const [roomName, setRoomName] = useState(initialRoomName);
  const [file, setFile] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);


  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    setRoomName(queryParams.get("roomName") || "");
  }, [roomID]);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(`http://${BACKEND_URI}`);
    }

    const socket = socketRef.current;
    socket.emit("join_room", roomID);

    socket.on("room_messages", (messages) => {
      setMessages(messages);
    });

    socket.on("receive_message", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socket.on("receive_file", (fileData) => {
      const { data, type, format, username } = fileData;
      const blob = new Blob([data], { type: `${type}/${format}` });
      const url = URL.createObjectURL(blob);
      
      setMessages((prevMessages) => [...prevMessages, { username, file: url, type, format }]);
    });

    return () => {
      socket.emit("leave_room", roomID);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomID]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const messageData = { roomID, username, message: newMessage };

      socketRef.current.emit("send_message", messageData);
      setMessages((prevMessages) => [...prevMessages, messageData]);
      setNewMessage("");
    }
  };

  const handleEditField = () => {
    setIsEditing(!IsEditing);
  };

  const RefreshTokenFunction = async () => {
    try {
      const refreshToken = localStorage.getItem("RefreshToken");
      const response = await axios.post(`http://${BACKEND_URI}/api/refresh-token`, { refreshToken, username });

      const newAccessToken = response.data.accessToken;
      localStorage.setItem("AccessToken", newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error("Error refreshing token:", error.response?.data || error.message);
      return null;
    }
  };

  const handleDeleteChat = async () => {
    if (window.confirm("You cannot retrieve a room after deleting it! Are you sure?")) {
      const AccessToken = localStorage.getItem("AccessToken");
      try {
        await axios.post(
          `http://${BACKEND_URI}/api/chat/delete`,
          { roomID, username },
          {
            headers: { Authorization: `Bearer ${AccessToken}` },
          }
        );
        alert("Chat deleted successfully!");
        navigate("/chat-gallery");
      } catch (error) {
        if (error.response) {
          const status = error.response.status;
          const errorMessage = error.response.data;
          if (status === 401) {
            alert("Access Denied: " + errorMessage);
          } else if (status === 403) {
            RefreshTokenFunction();
            alert("Session expired. Please log in again.");
            window.location.href = "/";
          } else {
            alert("Failed to delete the room, please try again!");
          }
        }
      }
    }
  };

  const changeRoomId = async () => {
    if (editRoomId.length > 10) {
      alert("Room name cannot exceed 10 characters.");
      return;
    }
    const AccessToken = localStorage.getItem("AccessToken");
    try {
      await axios.post(
        `http://${BACKEND_URI}/api/chat/set-name` ,
        { roomID, roomName: editRoomId },
        {
          headers: { Authorization: `Bearer ${AccessToken}` },
        }
      );
      alert("Room name updated successfully");
      setRoomName(editRoomId);
      setIsEditing(false);
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data;
        if (status === 401) {
          alert("Access Denied: " + errorMessage);
        } else if (status === 403) {
          RefreshTokenFunction();
          alert("Session expired. Please log in again.");
        } else {
          alert("Failed to update the room name, please try again!");
        }
      }
    }
  };



const sendFile = async () => {
  if (!file) return; // Ensure a file is selected

  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.onload = async () => {
    const binaryData = reader.result;
    const fileType = file.type.split("/")[0];
    const fileFormat = file.type.split("/")[1];

    setMessages((prevMessages) => [
      ...prevMessages,
      { username, file: URL.createObjectURL(file), type: fileType, format: fileFormat }
    ]);

    const fileData = {
      data: binaryData,
      type: fileType,
      format: fileFormat,
      username: username,
      roomID: roomID,
    };
    console.log("File send");
    socketRef.current.emit("send_file", fileData);
    setFile(null);
  };
};


  return (
    <div className="chat-room">
      <div className="room-header">
        <div className="room-info">
          <h2>Room Name: {roomName ? roomName : "Please Set the Room Name"}</h2>
          <h3>Room ID: {roomID}</h3>
        </div>

        <div className="button-group">
          {IsEditing ? (
            <>
              <input
                type="text"
                value={editRoomId}
                onChange={(e) => {
                  if (e.target.value.length <= 10) {
                    seteditRoomId(e.target.value);
                  }
                }}
              />
              <button className="edit-button" onClick={changeRoomId}>
                Save
              </button>
            </>
          ) : (
            <button className="edit-button" onClick={handleEditField}>
              <FaEdit />
            </button>
          )}

          <button className="delete-button" onClick={handleDeleteChat}>
            Delete
          </button>
        </div>
      </div>

      <h3>Welcome, {username}</h3>

      <div className="messages">
  {messages.map((msg, index) => (
    <div key={index} className={`message ${msg.username === username ? "my-message" : "other-message"}`}>
      <strong>{msg.username}:</strong> 
      {msg.file ? (
        msg.type === "image" ? (
          <img src={msg.file} alt="Sent File" style={{ maxWidth: "200px", borderRadius: "5px" }} />
        ) : (
          <a href={msg.file} download>📄 {msg.format.toUpperCase()} File</a>
        )
      ) : (
        msg.message
      )}
    </div>
  ))}
  <div ref={messagesEndRef} />
</div>


    <div className="send-message">

    <div className="emoji">
    <button onClick={() => setShowPicker(!showPicker)}>😀</button>
    {showPicker && (
      <div className="emoji-picker">
        <Picker
          data={data}
          onEmojiSelect={(emoji) => {
            setNewMessage((prev) => prev + emoji.native);
            setShowPicker(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
            }
          }}
          />
      </div>
    )}
  </div>

  <input
    type="text"
    placeholder="Type your message or select a file"
    value={file ? file.name : newMessage} // Show file name if selected
    onChange={(e) => setNewMessage(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (file) {
          sendFile();
        } else {
          sendMessage();
        }
      }
    }}
  />

  <input
    type="file"
    onChange={(e) => setFile(e.target.files[0])}
    style={{ display: "none" }}
    id="file-input" // ✅ Corrected ID
  />
  <button onClick={() => document.getElementById("file-input").click()}>
    📂
  </button>

  <button
    onClick={() => {
      if (file) {
        sendFile();
      } else {
        sendMessage();
      }
    }}
  >
    Send
  </button>
    </div>


    </div>
  );
}

export default ChatRoom;
