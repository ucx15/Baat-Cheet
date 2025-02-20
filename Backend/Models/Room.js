const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomID: { type: String, required: true, unique: true }, // Unique room ID
  users: [{ type: String }], // List of users in the room
  messages: [
    {
      username: { type: String, required: true }, // Username of the sender
      message: { type: String, required: true }, // The message content
      timestamp: { type: Date, default: Date.now }, // Timestamp of the message
    },
  ],
});

const Room = mongoose.model("Room", roomSchema);

// Database Abstraction Layer
const createRoom = async (roomID, username) => {
  const newRoom = new Room({ roomID, users: [username], messages: [] });
  return await newRoom.save();
};

const joinRoom = async (roomID, username) => {
  return await Room.findOneAndUpdate(
    { roomID },
    { $addToSet: { users: username } }, // Add user to the room if not already present
    { new: true }
  );
};

const getRoomMessages = async (roomID) => {
  const room = await Room.findOne({ roomID });
  return room ? room.messages : [];
};

const addMessageToRoom = async (roomID, username, message) => {
  return await Room.findOneAndUpdate(
    { roomID },
    { $push: { messages: { username, message } } }, // Add the message to the room
    { new: true }
  );
};

const findRoom = async (roomID) => {
  return await Room.findOne({ roomID });
};


module.exports = { Room, createRoom, joinRoom, getRoomMessages, addMessageToRoom, findRoom };
