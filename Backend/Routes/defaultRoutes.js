// Default Routes

const router = require('express').Router();

router.get('/', (req, res) => {
	console.log('INFO: GET /');
	res.json({message: "HOLA from BACKEND"});
});


router.get('*', (req, res) => {
	console.log('INFO: GET *');
	res.status(404).json({message: "404 Not Found"});
});

module.exports = router;
