const router = require('express').Router();

const User = require('../Models/User');
const userController = require('../Controllers/userController');


router.get('/', (req, res) => {
	console.log('INFO: GET /api/');
	res.json({message: "HOLA from API"});
});


router.post('/signup', userController.userSignup);
router.post('/login', userController.userLogin);

module.exports = router;
