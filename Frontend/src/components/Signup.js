import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/signup.css";
import { BACKEND_URI } from "../config";


function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {


      // Send user data to the backend (hashed password)
      const response = await axios.post(`http://${BACKEND_URI}/api/signup`, {
        username,
        password,
      });

      alert(response.data.message); // Show success message
      navigate("/"); // Redirect to login page
    } catch (error) {
      console.error("Error during signup:", error);
      // alert("Error:",error); // Handle errors
      alert(error.response.data.message); // Show success message

    }
  };

  return (
    <div className="signup-container">
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
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
        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Signup</button>
      </form>
      <p>
        Already have an account? <Link to="/">Login here</Link>
      </p>
    </div>
  );
}

export default Signup;


