const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
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

module.exports = {User, createUser, getUser };
