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

router.post('/chat/create', roomController.createRoom);
router.post('/chat/join', roomController.joinRoom);

module.exports = router;
