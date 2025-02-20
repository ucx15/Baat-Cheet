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

		const userRooms = await UserModel.getRooms(username);
		if (userRooms.includes(roomID)) {
			console.error(`WARN:\tUser "${username}" already in room`);
			return res.json({ message: "Joined room successfully", status: "success" });
		}

		await UserModel.addRoom(username, roomID);

		console.log(`\t'${username}' joined room ${roomID}`);
		res.json({ message: "Joined room successfully", status: "success" });
	} catch (error) {
		console.error("ERROR:\tCannot join room:", error);
		res.status(500).json({ error: "Database error" });
	}
};

module.exports = { createRoom, joinRoom };
