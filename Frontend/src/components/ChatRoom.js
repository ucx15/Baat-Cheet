import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { FaEdit } from "react-icons/fa"; 
import "../styles/ChatRoom.css";

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
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }

    const fetchOldMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/getMessages/${roomID}`);
        setMessages(response.data);
        scrollToBottom();
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchOldMessages();
  }, [roomID]);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:3000");
    }

    const socket = socketRef.current;
    socket.emit("join_room", roomID);

    socket.on("room_messages", (messages) => {
      setMessages(messages);
      scrollToBottom();
    });

    socket.on("receive_message", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      scrollToBottom();
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

      axios.post("http://localhost:3000/api/saveMessage", messageData).catch((error) => {
        console.error("Error saving message:", error);
      });

      scrollToBottom();
    }
  };

  const handleEditField = () => {
    setIsEditing(!IsEditing);
  };

  const navigate = useNavigate();

  const handleDeleteChat = async () => {
    if (window.confirm("You cannot retrieve a room after deleting it! Are you sure?")) {
      try {
        await axios.post("http://localhost:3000/api/chat/delete", { roomID, username });
        alert("Chat deleted successfully!");
        navigate("/chat-gallery"); 
      } catch (error) {
        console.error("Error Deleting Room", error.response?.data || error.message);
      }
    }
  };

  const changeRoomId = async () => {
    if (editRoomId.length > 10) {
      alert("Room name cannot exceed 10 characters.");
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/chat/set-name", {
        roomID: roomID,
        roomName: editRoomId,
      });
      alert("Room name updated successfully");
      setRoomName(editRoomId);
      setIsEditing(false);
      
    } catch (error) {
      alert("Error updating room, try again later.");
      setIsEditing(false);
      console.error("Error updating room:", error);
    }
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
              <button className="edit-button" onClick={changeRoomId}>Save</button>
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

      {/* Messages Container */}
      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.username === username ? "my-message" : "other-message"}`}
          >
            <strong>{msg.username}:</strong> {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input & Send Button */}
      <div className="send-message">
        <input
          type="text"
          placeholder="Type your message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatRoom;
