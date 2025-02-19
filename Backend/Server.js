const http = require('http')
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')
const { Server } = require('socket.io')


const apiRoutes = require("./Routes/apiRoutes");
const defaultRoutes = require("./Routes/defaultRoutes");

const RoomModel = require("./Models/Room.js");


dotenv.config()
const PORT = process.env.PORT || 3000
const HOST = process.env.HOST
const MONGO_URI = process.env.MONGO_URI

const app = express()
const server = http.createServer(app);

const io = new Server(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
		credentials: true
	}
});


app.use(cors({ origin: '*', credentials: true }))
app.use(express.json())


// Routing
app.use('/api', apiRoutes);
app.use('/', defaultRoutes);


// Socket.io Server
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

	// Handle disconnection
	socket.on('disconnect', () => {
		console.log(`WS:\tUser '${socket.id}' disconnected`);
	});
});

mongoose.connect(MONGO_URI)
	.then(() => {
		console.log('DB: Connected to MongoDB Atlas');
		server.listen(PORT, () => {
			console.log(`Backend running @ http://${HOST}:${PORT}`);
		});
	})
	.catch((err) => {
		console.error('ERROR: Cannot connect to Database:', err);
	});
