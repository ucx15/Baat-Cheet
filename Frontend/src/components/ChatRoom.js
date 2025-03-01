import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import "../styles/ChatRoom.css";
import { FaPhone, FaPhoneSlash } from "react-icons/fa"; 
import Peer from "peerjs";

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
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const navigate = useNavigate();

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

const [PeerID, setPeerID] = useState(null);
const [remotePeerID, setRemotePeerID] = useState(null);
const [isCalling, setIsCalling] = useState(false);

const peerRef = useRef(null);
const myVideoRef = useRef(null);
const remoteVideoRef = useRef(null);
const mediaStreamRef = useRef(null);


  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(`http://${BACKEND_URI}`);
    }
  
    peerRef.current = new Peer(undefined, {
      host: BACKEND_URI,
      port: 3000,
      path: "/peerjs",
      secure: false,
    });
  
    peerRef.current.on("open", (id) => {
      console.log("My Peer ID:", id);
      setPeerID(id);  // Update state
      socketRef.current.emit("peer_id", { roomID, PeerID: id });
    });
    
    peerRef.current.on("call", (call) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        mediaStreamRef.current = stream;
        myVideoRef.current.srcObject = stream;
        myVideoRef.current.play();
        call.answer(stream);
        call.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play();
        });
      });
    });
  
    socketRef.current.on("incoming_call", ({ callerPeerID }) => {
      console.log("Incoming call from:", callerPeerID);
      setRemotePeerID(callerPeerID);
      setIsCalling(true);
    });
    
    socketRef.current.on("call_accepted", ({ roomID, signal, PeerID }) => {
      console.log("Call accepted by:", PeerID);
      peerRef.current.signal(signal);
    });
    
    // Store current refs before cleanup
    const peerInstance = peerRef.current;
    console.log(peerInstance);
    const socketInstance = socketRef.current;
    console.log(socketInstance);
  
    return () => {
      if (peerInstance) {
        peerInstance.destroy();
      }
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [roomID]); // Keep dependencies minimal
  
  const startCall = () => {
    const peerID = peerRef.current.id;
    console.log(peerID);

    if (!peerRef.current || !peerRef.current.id) {
      console.error("❌ Peer ID is not available yet. Waiting...");
      return;
    }
  
      // Always get the latest ID
  
    console.log("Using PeerID:", peerID);
  
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      mediaStreamRef.current = stream;
      myVideoRef.current.srcObject = stream;
      myVideoRef.current.play();
  
      socketRef.current.emit("request_call", { roomID, callerPeerID: peerID });
  
      console.log("Started calling...");
  
      if (remotePeerID) {
        console.log("Calling:", remotePeerID);
        const call = peerRef.current.call(remotePeerID, stream);
        call.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play();
        });
      }
    }).catch(err => console.error("❌ Error accessing media devices:", err));
  };
   

const endCall = () => {
  if (mediaStreamRef.current) {
    mediaStreamRef.current.getTracks().forEach(track => track.stop());
  }
  if (myVideoRef.current) myVideoRef.current.srcObject = null;
  if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  setIsCalling(false);
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

          <button className="call-button" onClick={startCall}>
              <FaPhone /> Start Call
          </button>
          <button className="end-call-button" onClick={endCall}>
                <FaPhoneSlash /> End Call
            </button>
        </div>
      </div>

      <h3>Welcome, {username}</h3>

            <div className="video-container">
              <video ref={myVideoRef} className="video" autoPlay muted />
              <video ref={remoteVideoRef} className="video" autoPlay />
            </div>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.username === username ? "my-message" : "other-message"}`}>
            <strong>{msg.username}:</strong> {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

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

