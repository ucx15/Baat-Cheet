const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomID: { type: String, required: true, unique: true }, // Unique room ID
  roomName: { type: String, default: null }, // Name of the room
  admin: { type: String, required: true }, // Admin of the room
  isAnonymous:{type:Boolean,required:null},
  timestamp: { type: Date, default: Date.now }, // Timestamp of the room creation

  users: [{ type: String }], // List of users in the room
  messages: [
    {
      username: { type: String, required: true }, // Username of the sender
      message: { type: String, required: true }, // The message content
      isAnonymous: {type: String, required:true},
      timestamp: { type: Date, default: Date.now }, // Timestamp of the message
    },
  ],
});

const Room = mongoose.model("Room", roomSchema);

// Database Abstraction Layer
const createRoom = async (roomID, username) => {
  const newRoom = new Room({
    roomID,
    admin: username,
    users: [username],
    messages: [],
  });
  return await newRoom.save();
};

const deleteRoom = async (roomID, username) => {
  return await Room.findOneAndDelete({ roomID, admin: username });
}

const joinRoom = async (roomID, username) => {
  return await Room.findOneAndUpdate(
    { roomID },
    { $addToSet: { users: username } }, // Add user to the room if not already present
    { new: true }
  );
};

// return room by roomID without messages
const findRoom = async (roomID) => {
  return await Room.findOne({ roomID }, { messages: 0 });
};

const findRoomsWithUser = async (username) => {
  // return await Room.find({ users: username }, {_id:0, messages: 0, timestamp: 0});
  return await Room.find({ users: username }, {_id : 0, roomID : 1, roomName : 1, admin : 1, users:1});
};

// return IDs of all rooms
const getRoomIDs = async () => {
  const rooms = await Room.find({}, { roomID: 1 });
  return rooms ? rooms.map(room => room.roomID) : [];
};

// return names of all rooms
const getRoomNames = async () => {
  // get all rooms
  const rooms = await Room.find();
  console.log(rooms);

  return rooms ? rooms.map(room => room.roomName) : [];
};

// return Roomname by Room ID
const getRoomName = async (roomID) => {
  const room = await Room.findOne({ roomID });
  // console.log("room.roomName:", room.roomName);
  return room.roomName;
};

const setRoomName = async (roomID, roomName) => {
  return await Room.findOneAndUpdate
    (
      { roomID },
      { roomName },
      { new: true }
    );
};

const getRoomMessages = async (roomID) => {
  const room = await Room.findOne({ roomID });
  return room ? room.messages : [];
};

const addMessageToRoom = async (roomID, username, message ,isAnonymous) => {
  return await Room.findOneAndUpdate(
    { roomID },
    { $push: { messages: { username, message, isAnonymous } } }, // Add the message to the room
    { new: true }
  );
};


module.exports = { Room, createRoom, deleteRoom, joinRoom, findRoom, findRoomsWithUser, getRoomIDs, getRoomNames, getRoomName, setRoomName, getRoomMessages, addMessageToRoom };
