const jwt = require('jsonwebtoken')

require('dotenv').config()


const generateAccessToken = (username) => {
	return jwt.sign(
		{ username },
		process.env.JWT_ACCESS_SECRET,
		{ expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
}


const generateRefreshToken = (username) => {
	return jwt.sign(
		{ username },
		process.env.JWT_ACCESS_SECRET,
		{ expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
}


const authenticate = (req, res, next) => {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]

	if (!token) {
		return res.sendStatus(401)
	}

	jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
		if (err) {
			if (err == jwt.TokenExpiredError) {
				console.log('ERROR: JWT Token Expired');
			}

			console.error(err);
			return res.sendStatus(403);
		}

		req.USER = user.username;
		next()
	})

}


const refreshToken = (req, res) => {
	const refreshToken = req.body.refreshToken

	if (!refreshToken) {
		return res.status(401).json({ message: "Refresh Token not provided", status: "error" });
	}

	jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
		if (err) {
			console.error(err);
			return res.status(403).json({ message: "Invalid Refresh Token", status: "error" });
		}

		const accessToken = generateAccessToken({ username: user.username })
		res.json({message: "Token Refreshed", status: "success", accessToken})
	})
}


module.exports = { generateAccessToken, generateRefreshToken, authenticate, refreshToken};
