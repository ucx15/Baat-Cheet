import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";


import "../styles/login.css";

const HOST = window.location.hostname;
const BACKEND_URI = (HOST === "localhost") ? "localhost:3000" : HOST;

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState("password");

  const [icon, setIcon] = useState("🙈");

  const navigate = useNavigate();


  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`http://${BACKEND_URI}/api/login`, {
        username,
        password,
      });

      // setAccessToken(response.data.accessToken);
      // setRefreshToken(response.data.refreshToken);

      localStorage.setItem("AccessToken", response.data.accessToken);
      localStorage.setItem("RefreshToken", response.data.refreshToken);



      localStorage.setItem("username", username);
      console.log("Stored Username:", localStorage.getItem("username")); // Debugging log

      navigate("/chat-gallery"); // Redirect to Chat Gallery
    } catch (error) {
      alert("Login failed! Check credentials.", error);
    }
  };

  const handleToggle = () => {
    setType(type === "password" ? "text" : "password");
    setIcon(icon === "🙈" ? "👁️" : "🙈");
  };

  return (
    <div className="login-container">

      {/* Login Box */}

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
            <p className="icon" > {icon} </p>
          </span>
          <button type="submit">Login</button>
        </form>
        <p>
          Don't have an account? <Link to="/signup">Signup here</Link>
        </p>
      </div>

    </div>
  );
}

export default Login;
