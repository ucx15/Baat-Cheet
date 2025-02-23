import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Icon } from "react-icons-kit";
import { eyeOff } from "react-icons-kit/feather/eyeOff";
import { eye } from "react-icons-kit/feather/eye";
import "../styles/login.css";


function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState("password");
  const [icon, setIcon] = useState(eyeOff);
  const [showSplash, setShowSplash] = useState(true);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setShowSubtitle(true), 2000); // Show subtitle after 2.5 sec
    setTimeout(() => setShowSplash(false), 3000); // Hide splash after 4 sec
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:3000/api/login", {
        username,
        password,
      });

      localStorage.setItem("username", username);
      console.log("Stored Username:", localStorage.getItem("username")); // Debugging log

      navigate("/chat-gallery"); // Redirect to Chat Gallery
    } catch (error) {
      alert("Login failed! Check credentials.");
    }
  };

  const handleToggle = () => {
    setType(type === "password" ? "text" : "password");
    setIcon(icon === eyeOff ? eye : eyeOff);
  };

  return (
    <div className="login-container">
      {/* Splash Screen (Baat-Cheet) moved outside the login box */}
      {showSplash && (
        <div className="splash-container">
          <motion.div
            className="circle-animation"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0.4 }}
            transition={{ duration: 2 }}
          ></motion.div>
  
          <motion.h1
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2 }}
            className="app-name"
          >
            Baat-Cheet
          </motion.h1>
  
          {showSubtitle && (
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5 }}
              className="subtitle"
            >
              Your Secured Chatting Platform
            </motion.h2>
          )}
        </div>
      )}
  
      {/* Login Box */}
      {!showSplash && (
        <div className="login-page">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type={type}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="flex" onClick={handleToggle}>
              <Icon className="icon" icon={icon} size={25} />
            </span>
            <button type="submit">Login</button>
          </form>
          <p>
            Don't have an account? <Link to="/signup">Signup here</Link>
          </p>
        </div>
      )}
    </div>
  );
} 

export default Login;
