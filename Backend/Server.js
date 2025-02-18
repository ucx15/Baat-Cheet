const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const ws = require('ws')
const cors = require('cors')

const apiRoutes = require("./Routes/apiRoutes");
const defaultRoutes = require("./Routes/defaultRoutes");


dotenv.config()
const PORT = process.env.PORT || 3000
const HOST = process.env.HOST
const MONGO_URI = process.env.MONGO_URI


const app = express()

app.use(cors(
	{
		origin: '*',
		credentials: true
	}
))
app.use(express.json())


// Routing
app.use('/api', apiRoutes);
app.use('/', defaultRoutes);


// Server
// mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.connect(MONGO_URI)
	.then(() => {
		console.log('INFO: Connected to Database');
		app.listen(PORT, () => {
			console.log(`Backend running @ http://${HOST}:${PORT}`);
		});
	})
	.catch((err) => {
		console.error('ERROR: Cannot connect to Database:', err);
	});
