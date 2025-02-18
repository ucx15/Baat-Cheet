const router = require('express').Router();

const User = require('../Models/User');


router.get('/', (req, res) => {
	console.log('INFO: GET /api/');
	res.json({message: "HOLA from API"});
});

router.get('/login', (req, res) => {
	console.log('INFO: GET /api/login');
	res.json({message: "Successfull login", status: "success"});
});

router.get('/signup', (req, res) => {
	console.log('INFO: GET /api/signup');
	res.json({message: "Successfull Signup", status: "success"});
});

module.exports = router;
