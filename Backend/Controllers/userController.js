const bcrypt = require("bcrypt");
const UserModel = require("../Models/User");
require('dotenv').config();


const SALT_ROUNDS =  Number(process.env.SALT_ROUNDS);


const userSignup = async (req, res) => {
	console.log('POST: /api/signup');

	try {
		const { username, password } = req.body;
		if (!username) {
			console.error('ERROR: Username not provided');
			res.status(400).json({ message: "Username not provided", status: "error" });
			return;
		}

		const user = await UserModel.getUser(username);
		// Check if user laready exists
		if (user) {
			console.error(`ERROR:\tUser ${username} already exists in the database`);
			res.status(409).json({ message: "User Already exists", status: "error" });
		}

		else {
			// Create new user
			const SALT = await bcrypt.genSalt(SALT_ROUNDS);
			const hashedPassword = await bcrypt.hash(password, SALT);

			await UserModel.createUser(username, hashedPassword);
			res.json({ message: "Successfull Signup", status: "success" });
		}
	}
	catch (error) {
		console.error('ERROR: Cannot create user:', error);
		res.status(500).json({ error: "Database error" });
	}
};


const userLogin = async (req, res) => {
	console.log('POST: /api/login');

	try {
		const { username, password } = req.body;

		if (!username) {
			console.error('ERROR: Username not provided');
			res.status(400).json({ message: "Username not provided", status: "error" });
			return;
		}

		const user = await UserModel.getUser(username);

		if (user) {
			if (await bcrypt.compare(password, user.password)) {
				console.log(`\t\t'${username}' Loggedin`);
				res.json({ message: "Logged in Successfully!", status: "success", username: username });
			}
			else {
				console.error(`ERROR: Invalid Password for user ${username}`);
				res.status(401).json({ message: "Invalid Password", status: "error" });
			}
		}
		else {
			console.error(`ERROR: User ${username} not found`);
			res.status(404).json({ message: "User not found", status: "error" });
		}
	}
	catch (error) {
		console.error('ERROR: Cannot Login:', error);
		res.status(500).json({ error: "Database error" });
	}
};


module.exports = { userSignup, userLogin };
