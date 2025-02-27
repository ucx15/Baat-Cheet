const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require('dotenv').config();


const UserModel = require("../Models/User");
const RoomModel = require("../Models/Room");
const authController = require("./authController");


const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);


const userSignup = async (req, res) => {
    console.log("POST: /api/signup");

    try {
        const { username, password, publicKey } = req.body;

        if (!username || !publicKey) {
            console.error("ERROR: Username or Public Key not provided");
            return res.status(400).json({ message: "Username or Public Key not provided", status: "error" });
        }

        // Check if the user already exists
        const user = await UserModel.getUser(username);
        if (user) {
            console.error(`ERROR:\tUser ${username} already exists in the database`);
            return res.status(409).json({ message: "User Already exists", status: "error" });
        }

        // Hash the password
        const SALT = await bcrypt.genSalt(SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, SALT);

        // Store user with public key
        await UserModel.createUser(username, hashedPassword, publicKey);

        res.json({ message: "Successful Signup", status: "success" });
    } catch (error) {
        console.error("ERROR: Cannot create user:", error);
        res.status(500).json({ error: "Database error" });
    }
};

const userLogin = async (req, res) => {
	console.log('POST: /api/login');

	try {
		const { username, password} = req.body;

		if (!username) {
			console.error('ERROR: Username not provided');
			res.status(400).json({ message: "Username not provided", status: "error" });
			return;
		}

		const user = await UserModel.getUser(username);
		if (!user) {
			console.error(`ERROR: User ${username} not found`);
			res.status(404).json({ message: "User not found", status: "error" });
		}

		if (await bcrypt.compare(password, user.password)) {

			const accessToken  = authController.generateAccessToken(username);
			const refreshToken = authController.generateRefreshToken(username);
			
			const publicKey = user.publicKey;
			console.log('Public Key:', publicKey);
			
			res.json({
				message: "Logged in Successfully!",
				status: "success",
				accessToken,
				refreshToken,
				publicKey,
			 });
		}

		else {
			console.error(`ERROR: Invalid Password for user ${username}`);
			res.status(401).json({ message: "Invalid Password", status: "error" });
		}


	}

	catch (error) {
		console.error('ERROR: Cannot Login:', error);
		res.status(500).json({ error: "Database error" });
	}
};

const userFetchRoomsWithDetails = async (req, res) => {
	console.log('POST: /api/fetch-user-rooms');

	try {
		const { username } = req.body;

		if (!username) {
			console.error('ERROR: Username not provided');
			res.status(400).json({ message: "Username not provided", status: "error" });
			return;
		}

		const user = await UserModel.getUser(username);

		if (!user) {
			console.error(`ERROR: User ${username} not found`);
			res.status(404).json({ message: "User not found", status: "error" });
			return;
		}
		const roomsIDs = user.rooms;

		if (!roomsIDs) {
			console.error(`WARN: User ${username} has no rooms yet!`);
			res.json({ message: "User has no rooms yet!", status: "success" });
			return;
		}

		const roomIDandUsers = await RoomModel.findRoomsWithUser(username);

		console.log(`\t'${username}' fetched its rooms`);
		res.json({ rooms: roomIDandUsers, status: "success" });
	}
	catch (error) {
		console.error('ERROR: Cannot fetch rooms:', error);
		res.status(500).json({ error: "Database error" });
	}
};

const getUserPublicKey = async (req, res) => {
	const { username } = req.params;
  
	try {
	  const user = await UserModel.getUser(username);
	  if (!user) {
		return res.status(404).json({ message: "User not found", status: "error" });
	  }
  
	  res.json({ publicKey: user.publicKey });
	} catch (error) {
	  console.error("ERROR: Cannot fetch public key:", error);
	  res.status(500).json({ message: "Server error", status: "error" });
	}
  };
  
module.exports = { userSignup, userLogin, userFetchRoomsWithDetails, getUserPublicKey };
