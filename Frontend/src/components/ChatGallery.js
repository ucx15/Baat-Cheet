import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";


function ChatGallery() {  // ✅ Function name must start with uppercase
  const [chatRooms, setChatRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")); // Get user from storage

    if (!user) {
      navigate("/login"); // Redirect to login if no user found
      return;
    }

    // Fetch user's chatrooms from backend
    axios.get(`/api/chatrooms/${user._id}`)
      .then(response => setChatRooms(response.data))
      .catch(error => console.error("Error fetching chatrooms:", error));
  }, [navigate]);

  return (
    <div className="chat-gallery">
      <h2>Your Chats</h2>
      <ul>
        {chatRooms.length > 0 ? (
          chatRooms.map(room => (
            <li key={room._id}>
              <Link to={`/chat/${room._id}`} className="chat-room">
                {room.name}
              </Link>
            </li>
          ))
        ) : (
          <p>No chats found</p>
        )}
      </ul>
    </div>
  );
}

export default ChatGallery;
