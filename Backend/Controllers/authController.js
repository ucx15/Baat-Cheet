const jwt = require('jsonwebtoken')

require('dotenv').config()


const generateAccessToken = (username) => {
	console.log(`Generating Access Token for '${username}'`);
	return jwt.sign(
		{ username },
		process.env.JWT_ACCESS_SECRET,
		{ expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
}


const generateRefreshToken = (username) => {
	console.log(`Generating Refresh Token for '${username}'`);
	return jwt.sign(
		{ username },
		process.env.JWT_REFRESH_SECRET,
		{ expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
}


const authenticate = (req, res, next) => {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]

	if (!token) {
		return res.sendStatus(401)
	}

	jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
		if (err) {
			console.error(`ERROR:\tAccess token  expired for user:'${req.body.username}'\n${err}`);
			return res.status(403).json({ message: "Invalid Access Token", status: "error" });
		}

		req.USER = user.username;
		next()
	})

}


const refreshToken = (req, res) => {
	const refreshToken = req.body.refreshToken
	const username = req.body.username

	if (!refreshToken || !username.trim()) {
		return res.status(401).json({ message: "Refresh Token not provided", status: "error" });
	}

	jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
		if (err) {
			console.error("Invalid Refresh Token for: ", err);
			return res.status(403).json({ message: "Invalid Refresh Token", status: "error" });
		}

		if (user.username !== username) {
			return res.status(403).json({ message: "Invalid Refresh Token", status: "error" });
		}

		const accessToken = generateAccessToken( user.username )
		res.json({ message: "Token Refreshed", status: "success", accessToken })
	})
}


module.exports = { generateAccessToken, generateRefreshToken, authenticate, refreshToken };
