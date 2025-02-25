const router = require('express').Router();

// const User = require('../Models/User');
const userController = require('../Controllers/userController');
const roomController = require('../Controllers/roomController');
const authController = require('../Controllers/authController');


router.get('/', (req, res) => {
	console.log("GET: /api/");
	res.json({ message: "HOLA from API" });
});


router.post('/signup', userController.userSignup);
router.post('/login', userController.userLogin);
// router.post('/logout', userController.userLogout);

router.post('/refresh-token', authController.refreshToken);
router.post('/fetch-user-rooms', authController.authenticate, userController.userFetchRoomsWithDetails);

router.post('/chat/create', authController.authenticate, roomController.createRoom);
router.post('/chat/delete', authController.authenticate, roomController.deleteRoom);
router.post('/chat/join', authController.authenticate, roomController.joinRoom);
router.post('/chat/set-name', authController.authenticate, roomController.setRoomName);
router.post('/chat/rooms', authController.authenticate, roomController.getRooms);  // for testing only, should be removed in production

module.exports = router;

// TODO: logout route
// TODO: middleware JWT auth
