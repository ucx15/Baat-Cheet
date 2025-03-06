const http = require('http')
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')
const { Server } = require('socket.io')


const apiRoutes = require("./Routes/apiRoutes");
const defaultRoutes = require("./Routes/defaultRoutes");

const RoomModel = require("./Models/Room.js");

// Environment Variables
dotenv.config()
const PORT = process.env.PORT;
const HOST = process.env.HOST;
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


// HTTP Sever
const server = http.createServer(app);

server.listen(PORT, () => {
	console.log(`Backend running @ http://${HOST}:${PORT}`);
});


// Socket.io Server
const io = new Server(
	server,
	{
		cors: CORS_CONFIG,
		maxHttpBufferSize: 1e8 // 100 MB
	});

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

	// TODO: send callback acknowledgements

	// Send a message
	socket.on('send_message', async ({ roomID, username, message ,isAnonymous }) => {
		console.log(roomID, username, message, isAnonymous);
		await RoomModel.addMessageToRoom(roomID, username, message, isAnonymous);
		socket.to(roomID).emit('receive_message', { username, message, isAnonymous});
	});

	socket.on('send_file', async ({data, type, format, username, roomID}) => {
		// Acknowledgement
		// callback({ status: 'success' });

		console.log('WS:\tReceived file from', username);

		// TODO: Save the image to File System and location to the database
		await RoomModel.addFileToRoom(data, type, format, username, roomID);

		// Broadcast the message to everyone in the room
		socket.to(roomID).emit('receive_file', { data, type, format, username });
	})

	// Handle disconnection
	socket.on('disconnect', () => {
		console.log(`WS:\tUser '${socket.id}' disconnected`);
	});
});
