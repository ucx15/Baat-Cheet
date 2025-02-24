const router = require('express').Router();

const User = require('../Models/User');
const userController = require('../Controllers/userController');
const roomController = require('../Controllers/roomController');


router.get('/', (req, res) => {
	console.log("GET: /api/");
	res.json({message: "HOLA from API"});
});


router.post('/signup', userController.userSignup);
router.post('/login', userController.userLogin);
// router.post('/logout', userController.userLogout);
router.post('/fetch-user-rooms', userController.userFetchRoomsWithDetails);

router.post('/chat/create', roomController.createRoom);
router.post('/chat/delete', roomController.deleteRoom);
router.post('/chat/join', roomController.joinRoom);
router.post('/chat/set-name', roomController.setRoomName);
router.post('/chat/rooms', roomController.getRooms);

module.exports = router;

// TODO: logout route
// TODO: middleware JWT auth
