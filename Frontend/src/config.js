// File: Frontend/src/config.js

// To use it, create a .env file in the root of your project with the following content:
// BACKEND_URI = <backend url>


const environment = import.meta.env;

const BACKEND_URI = environment.VITE_BACKEND_URI || "http://localhost:3000/api";
console.log("Backend URI:", environment.VITE_BACKEND_URI);

export default BACKEND_URI;
