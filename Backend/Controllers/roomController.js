const RoomModel = require("../Models/Room");
const UserModel = require("../Models/User");


const createRoom = async (req, res) => {
	console.log("POST: /api/chat/create");

	try {
		const { roomID, username } = req.body;

		if (!roomID || !username) {
			console.error("ERROR:\tMissing required fields");
			return res.status(400).json({ message: "Missing required fields", status: "error" });
		}

		// Check if the room already exists
		if (await RoomModel.findRoom(roomID)) {
			console.error(`ERROR:\tRoom ${roomID} already exists`);
			return res.status(409).json({ message: "Room already exists", status: "error" });
		}

		await RoomModel.createRoom(roomID, username);
		if (!await RoomModel.findRoom(roomID)) {
			// Failed to create a Room
			console.error(`ERROR:\tRoom ${roomID} not found`);
			return res.status(404).json({ message: "Room not found", status: "error" });
		}

		await UserModel.addRoom(username, roomID);

		console.log(`\tUser ${username} created room ${roomID}`);
		res.json({ message: "Room created successfully", status: "success" });
	}
	catch (error) {
		console.error("ERROR:\tCannot create room:", error);
		res.status(500).json({ error: "Database error" });
	}
};

const deleteRoom = async(req, res) => {

	try {
		const { roomID, username } = req.body;

		if (!roomID || !username) {
			console.error("ERROR:\tMissing required fields");
			return res.status(400).json({ message: "Missing required fields", status: "error" });
		}

		const deleted = await RoomModel.deleteRoom(roomID, username);
		if ( !deleted ) {
			// Failed to delete a Room
			console.error(`ERROR:\tDeleting Room:${roomID} requires admin privilage or room not found`);
			return res.status(404).json({ message: `Deleting Room:${roomID} requires admin privilage or room not found`, status: "error" });
		}

		await UserModel.removeRoomfromAllUsers(roomID);

		console.log(`\tUser ${username} deleted room ${roomID}`);
		res.json({ message: "Room deleted successfully", status: "success" });
	}
	catch (error) {
		console.error("ERROR:\tCannot delete room:", error);
		res.status(500).json({ error: "Database error" });
	}
}

const joinRoom = async (req, res) => {
	console.log("POST: /api/chat/join");

	try {
		const { roomID, username } = req.body;

		if (!roomID || !username) {
			console.error("ERROR:\tMissing required fields");
			return res.status(400).json({ message: "Missing required fields", status: "error" });
		}

		const room = await RoomModel.joinRoom(roomID, username);
		if (!room) {
			return res.status(404).json({ message: "Room not found", status: "error" });
		}

		const userRooms = await UserModel.getUserRoomIDs(username);
		if (userRooms.includes(roomID)) {
			console.error(`WARN:\tUser "${username}" already in room`);
			return res.json({ message: "Joined room successfully", status: "success" });
		}

		await UserModel.addRoom(username, roomID);

		console.log(`\t'${username}' joined room ${roomID}`);
		res.json({ message: "Joined room successfully", status: "success" });
	}
	catch (error) {
		console.error("ERROR:\tCannot join room:", error);
		res.status(500).json({ error: "Database error" });
	}
};

const setRoomName = async (req, res) => {
	console.log("POST: /api/chat/set-name");

	try {
		const { roomID, roomName } = req.body;

		if (!roomID || !roomName) {
			console.error(`ERROR:\tMissing required fields RoomID: '${roomID}'  RoomName: '${roomName}'`);
			return res.status(400).json({ message: `Missing required fields RoomID: '${roomID}'  RoomName: '${roomName}'`, status: "error" });
		}

		const room = await RoomModel.setRoomName(roomID, roomName);
		if (!room) {
			console.error(`ERROR:\tRoom ${roomID} not found`);
			return res.status(404).json({ message: `Room ${roomID} not found`, status: "error" });
		}

		console.log(`\tRoomID '${roomID}' renamed to '${roomName}'`);
		res.json({ message: `RoomID '${roomID}' renamed to '${roomName}'`, status: "success" });
	}
	catch (error) {
		console.error("ERROR:\tCannot set room name:", error);
		res.status(500).json({ error: "Database error" });
	}
};

const getRooms = async (req, res) => {
	console.log("POST: /api/chat/rooms");

	try {
		const rooms = await RoomModel.getRoomIDs();
		// const rooms = await RoomModel.getRoomNames();
		// const roomNames = rooms.map(room => room.roomName);

		console.log(`\tFound ${rooms.length} rooms`);
		res.json({ rooms, status: "success" });
	}
	catch (error) {
		console.error("ERROR:\tCannot fetch rooms:", error);
		res.status(500).json({ error: "Database error" });
	}
};

module.exports = { createRoom, joinRoom, deleteRoom, setRoomName , getRooms};
