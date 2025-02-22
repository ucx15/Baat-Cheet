const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rooms: [{ type: String, ref: "Room" }],
});


const User = mongoose.model("User", userSchema);


// Database Abstract Layer
const createUser = async (username, password) => {
	  const user = new User({ username, password });
  return await user.save();
}

const getUser = async (username) => {
	return await User.findOne({ username });
};


const addRoom = async (username, roomID) => {
  const user = await User.findOne({username});
  user.rooms.push(roomID);
  return await user.save();
}

const getUserRoomIDs = async (username) => {
  const user = await User.findOne({username});
  return user.rooms;
}


module.exports = {User, createUser, getUser , addRoom, getUserRoomIDs};
