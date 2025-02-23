import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "../styles/SplashScreen.css";

function SplashScreen() {
  const [showSubtitle, setShowSubtitle] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setShowSubtitle(true), 2500); // Show subtitle after 2.5 sec
    setTimeout(() => navigate("/"), 4000); // Redirect to login after 4 sec
  }, [navigate]);

  return (
    <div className="splash-container">
      {/* Animated Background Circle */}
      <motion.div
        className="circle-animation"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1.5, opacity: 0.4 }}
        transition={{ duration: 2 }}
      ></motion.div>

      {/* Baat-Cheet Animated Text */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2 }}
        className="app-name"
      >
        Baat-Cheet
      </motion.h1>

      {/* Subtitle Appears After Delay */}
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
  );
}

export default SplashScreen;
