import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FaEdit } from 'react-icons/fa'; // Example using Font Awesome
// import "../styles/ChatRoom.css";

function ChatRoom() {
  const {roomID , setroomID} = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [editRoomId, seteditRoomId] = useState("");
  const [IsEditing, setIsEditing] = useState(false);
  
  const socketRef = useRef(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }

    // Fetch old messages from the backend
    const fetchOldMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/getMessages/${roomID}`);
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchOldMessages();
  }, [roomID]);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:3000"); // Initialize socket connection
    }

    const socket = socketRef.current;
    socket.emit("join_room", roomID);

    socket.on("room_messages", (messages) => {
      setMessages(messages);
    });

    socket.on("receive_message", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
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

      // Store message in DB
      axios.post("http://localhost:3000/api/saveMessage", messageData).catch((error) => {
        console.error("Error saving message:", error);
      });
    }
  };

  const handleEditField = () => {
    if(IsEditing === true){
      setIsEditing(false);
    }
    else{
      setIsEditing(true);
      <button onClick={changeRoomId}>Save</button>
    }
  };

  const changeRoomId = async () => {

    seteditRoomId(editRoomId);

    try {
      await axios.post("http://localhost:3000/api/chat/editedRoomId", {
        roomID: roomID,
        changedId: editRoomId,
      });
      alert("Room name updated successfully");
      setIsEditing(false);
      console.log("Room created successfully:", editRoomId);
    } catch (error) {
      alert("Error updating room , Try after some time");
      setIsEditing(false);
      console.error("Error updating room:", error);
      
    }
    


  };

  

  return (
    <div className="chat-room">
      <h2>Room: {roomID} 
        {IsEditing ? (
          <>
          <input
          type="Edit Room Name"
          value={editRoomId}
          onChange={(e) => seteditRoomId(e.target.value)}
        
          />
          <button onClick={() => { 
            changeRoomId(); 
            
          }}>Save</button> 
          </>
         ) : (null)}
         
         

          <button onClick={(handleEditField)}>
           <FaEdit/>
          </button>

      </h2>

          

          <h3>Welcome, {username ? username : "Guest"}</h3>

          <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.username === username ? "my-message" : "other-message"}`}
          >
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
