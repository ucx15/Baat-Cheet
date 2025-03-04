import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios, { isAxiosError } from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import "../styles/ChatRoom.css";
import { FaPhone, FaPhoneSlash } from "react-icons/fa"; 
import Peer from "peerjs";

import leoProfanity from "leo-profanity";

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
  const [isAnonymous,setIsAnonymous] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const navigate = useNavigate();

  const [PeerID, setPeerID] = useState(null);
  const [remotePeerID, setRemotePeerID] = useState(null);
  const [isCalling, setIsCalling] = useState(false);

  const peerRef = useRef(null);
  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);

 


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

  // useEffect(() => {
  //   if (isAnonymous) {
  //     const timer = setTimeout(() => {
  //       setIsAnonymous(false);
  //     }, 5 * 60 * 1000); // 5 minutes

  //     return () => clearTimeout(timer);
  //   }
  // }, [isAnonymous]);
  

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


  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(`http://${BACKEND_URI}`);
    }
    
    console.log(BACKEND_URI);

    peerRef.current = new Peer(undefined, {
      host: "localhost",  // Change to your actual backend domain/IP
      port: 9000,  // Use port 443 for HTTPS
      path: "/",  // Ensure this matches the backend path
      secure: false,  // Must be true for HTTPS
      debug: 3,  // Enable debugging
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" }, // Add a public STUN server
        ],
      },
    });
    
    
    console.log("peerRef",peerRef.current);

    
    peerRef.current.on("open", (id) => {
      console.log("My Peer ID:", id);
      setPeerID(id);  // Update state after Peer ID is available
      socketRef.current.emit("peer_id", { roomID, PeerID: id });
    });
    

    peerRef.current.on("error", (err) => {
      console.error("❌ Peer error:", err);
    });
    
    

    peerRef.current.on("call", (call) => {
      console.log("📞 Incoming call from:", call.peer);
    
      // Prompt user to accept or reject the call
      if (window.confirm(`Incoming call from ${call.peer}. Accept?`)) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then((stream) => {
            mediaStreamRef.current = stream;
    
            // Play local video
            myVideoRef.current.srcObject = stream;
            myVideoRef.current.play();
    
            // Answer the call with our stream
            call.answer(stream);
    
            // Listen for the remote stream
            call.on("stream", (remoteStream) => {
              console.log("✅ Remote stream received!");
              remoteVideoRef.current.srcObject = remoteStream;
              remoteVideoRef.current.play();
            });
          })
          .catch((error) => {
            console.error("❌ Error accessing media devices:", error);
          });
      } else {
        console.log("❌ Call rejected");
      }
    });
    
  
   socketRef.current.on("incoming_call", ({ callerPeerID }) => {
  console.log("📞 Incoming call from:", callerPeerID);

  // Store the caller ID and show UI buttons
  setRemotePeerID(callerPeerID);
  setIsCalling(true); // This will show a UI button
});


    
    socketRef.current.on("call_accepted", ({ PeerID }) => {
  console.log("✅ Call accepted by:", PeerID);
  
  // Establish a direct connection
  const conn = peerRef.current.connect(PeerID);
  conn.on("open", () => {
    console.log("🔗 Connection opened with", PeerID);
  });
});

    
    // Store current refs before cleanup
    const peerInstance = peerRef.current;
    // console.log(peerInstance);
    const socketInstance = socketRef.current;
    // console.log(socketInstance);
  
    return () => {
      if (peerInstance) {
        peerInstance.destroy();
      }
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [roomID]); // Keep dependencies minimal
  
  

leoProfanity.loadDictionary("en"); // Load English dictionary
leoProfanity.add(leoProfanity.getDictionary('hi')); // Add Hindi bad words manually

const handleInputChange = (e) => {
  setNewMessage(e.target.value);
};

const handleKeyDown = (e) => {
  if (e.key === " ") {
    const words = newMessage.trim().split(" ");
    const lastWord = words[words.length - 1]; // Get last typed word

    if (leoProfanity.check(lastWord)) {
      alert("🚫 Inappropriate word detected!");
      words.pop(); // Remove the last word
      setNewMessage(words.join(" ")); // Update the input field
      e.preventDefault();
    }
  }

  if (e.key === "Enter") {
    e.preventDefault(); // Prevent default enter behavior

    // Final check before sending
    if (leoProfanity.check(newMessage.trim())) {
      alert("🚫 Your message contains inappropriate words!");
      return;
    }

    sendMessage(); // Send message if clean
  }
};

const handleFeedback = () => {
  if (!isAnonymous) {
    console.log("Starting Feedback Chat...");
    alert("Started Feedback Chat");
  } else {
    console.log("Ending Feedback Chat...");
    alert("Ending Feedback Chat");
  }

  setIsAnonymous((prev) => !prev);
};


const sendMessage = () => {
  if (leoProfanity.check(newMessage.trim())) {
    alert("🚫 Your message contains inappropriate words!");
    return;
  }

  if (newMessage.trim()) {
    const messageData = { 
      roomID, 
      username, 
      message: newMessage, 
      isAnonymous: isAnonymous ? "true" : "false"  // ✅ Store as string
    };

    
    console.log(messageData);
    socketRef.current.emit("send_message", messageData);
    setMessages((prevMessages) => [...prevMessages, messageData]);
    setNewMessage("");
  }
};


  const startCall = () => {
    console.log(peerRef.current);
    console.log(peerRef.current.id);
    const PeerID = peerRef.current.id;
    console.log(PeerID);

    if (!peerRef.current || !peerRef.current.id) {
      console.error("❌ Peer ID is not available yet. Waiting...");
      return;
    }
  
      // Always get the latest ID
  
    console.log("Using PeerID:", PeerID);
  
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      mediaStreamRef.current = stream;
      myVideoRef.current.srcObject = stream;
      myVideoRef.current.play();
  
      socketRef.current.emit("request_call", { roomID, callerPeerID: PeerID });
  
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

const acceptCall = (callerPeerID) => {
  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((stream) => {
      mediaStreamRef.current = stream;
      myVideoRef.current.srcObject = stream;
      myVideoRef.current.play();

      // Answer the call
      const call = peerRef.current.call(callerPeerID, stream);
      call.on("stream", (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play();
      });

      setIsCalling(false); // Hide the popup
    })
    .catch((error) => {
      console.error("❌ Error accessing media devices:", error);
    });
};

const rejectCall = () => {
  console.log("❌ Call rejected");
  setIsCalling(false); // Hide the popup
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
          
          <button className="Anonymous" onClick={handleFeedback}>
              {isAnonymous ? "End FeedBack Chat" : "Start FeedBack Chat"}
          </button>

        </div>
      </div>

      <h3>Welcome, {username}</h3>

            <div className="video-container">
              <video ref={myVideoRef} className="video" autoPlay muted />
              <video ref={remoteVideoRef} className="video" autoPlay />
            </div>

            {isCalling && (
              <div className="incoming-call-popup">
              <p>📞 Incoming call from {remotePeerID}</p>
              <button onClick={() => acceptCall(remotePeerID)}>Accept</button>
              <button onClick={rejectCall}>Reject</button>
            </div>
          )}

      

<div className="messages">
  {messages.map((msg, index) => (
    <div key={index} className={`message ${msg.username === username ? "my-message" : "other-message"}`}>
      {msg.isAnonymous === "true" ? (  // ✅ Compare as a string
        <>{msg.message}</>
      ) : (
        <>
          <strong>{msg.username}:</strong> {msg.message}
        </>
      )}
    </div>
  ))}
  <div ref={messagesEndRef} />
</div>

      <div className="send-message">
        <input
          type="text"
          placeholder="Type your message"
          value={newMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatRoom;
