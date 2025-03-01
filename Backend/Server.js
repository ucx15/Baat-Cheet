const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const { Server } = require('socket.io');
const { PeerServer } = require('peer');

const apiRoutes = require("./Routes/apiRoutes");
const defaultRoutes = require("./Routes/defaultRoutes");
const RoomModel = require("./Models/Room.js");

// Load Environment Variables
dotenv.config();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
const MONGO_URI = process.env.MONGO_URI;


const CORS_CONFIG = {
	origin: '*',
	methods: ['GET', 'POST'],
	credentials: true
};

// Database Connection
mongoose.connect(MONGO_URI)
.then(() => {
	console.log('DB: Connected to MongoDB Atlas');
})
.catch((err) => {
	console.error('ERROR: Cannot connect to Database:', err);
});

// Express Setup
const app = express();
app.use(cors(CORS_CONFIG));
app.use(express.json());

// Routing
app.use('/api', apiRoutes);
app.use('/', defaultRoutes);

// HTTP Server
const server = http.createServer(app);

// Attach PeerJS to Existing Server
const peerServer = PeerServer({
	server,  // Attach to your existing Express HTTP server
	path: '/peerjs'
});

app.use("/peerjs", peerServer);
// Start Server
server.listen(PORT, () => {
	console.log(`Backend running @ http://${HOST}:${PORT}`);
	console.log(`Peer server is running @ http://${HOST}:${PORT}/peerjs`);
});

// Socket.io Server
const io = new Server(server, { cors: CORS_CONFIG });

const peers = {};

io.on('connection', (socket) => {
	console.log(`WS:\tUser '${socket.id}' connected`);

	// Join a room
	socket.on('join_room', async (roomID) => {
		socket.join(roomID);
		console.log(`WS:\tUser joined room '${roomID}'`);

		// Fetch and send previous messages
		const messages = await RoomModel.getRoomMessages(roomID);
		socket.emit('room_messages', messages);
	});

	// Send a message
	socket.on('send_message', async ({ roomID, username, message }) => {
		// Save the message to the database
		await RoomModel.addMessageToRoom(roomID, username, message);

		// Broadcast the message to everyone in the room
		socket.to(roomID).emit('receive_message', { username, message });
	});

	socket.on("peer_id", ({ roomID, PeerID }) => {
		peers[socket.id] = PeerID;
		socket.join(roomID);
		console.log(`WS: Peer ${PeerID} joined room ${roomID}`);
	});

	// Handle call request
	socket.on("request_call", ({ roomID, callerPeerID }) => {
		console.log(`WS: User '${callerPeerID}' is calling room '${roomID}'`);
		socket.to(roomID).emit("incoming_call", { callerPeerID });
	});

	// Handle answering the call
	socket.on("answer_call", ({ roomID, signal, PeerID }) => {
		socket.to(roomID).emit("call_accepted", { signal, PeerID });
	});

	// Handle disconnection
	socket.on('disconnect', () => {
		delete peers[socket.id];
		console.log(`WS:\tUser '${socket.id}' disconnected`);
	});
});
