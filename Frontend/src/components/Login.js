import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import bcrypt from "bcryptjs";
import { Link } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Fetch stored hash from backend
      const response = await axios.post("http://localhost:5000/api/login", {
        username,
      });

      const storedHash = response.data.hashedPassword; // Get stored hashed password

      // Compare entered password with stored hash
      const isMatch = await bcrypt.compare(password, storedHash);

      if (isMatch) {
        localStorage.setItem("user", JSON.stringify(response.data.user)); // Save user data
        navigate("/chat-gallery"); // Redirect to Chat Gallery
      } else {
        alert("Invalid credentials!");
      }
    } catch (error) {
      alert("Login failed! Check credentials.");
    }
  };

  return (
    <div className="auth-container">
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
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>
        Doesnt have an account? <Link to="/signup">Signup here</Link>
      </p>
    </div>
  );
}

export default Login;
