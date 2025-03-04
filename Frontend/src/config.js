const HOST = window.location.hostname;
// const PORT = (HOST === "localhost") ? 3000 : 80;  // For production development
// const PORT = 80;  // For production deployment
const PORT = 3000;
const BACKEND_URI = `${HOST}:${PORT}`;

export { BACKEND_URI };
