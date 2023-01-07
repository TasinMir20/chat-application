/*****###### Dependencies Start ######*****/

/* Dependencies Modules*/
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const morgan = require("morgan");

const http = require("http");

// routes imports
const routes = require("./routes/routes");

/*****###### Dependencies End ######*****/

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);
global.io = io;

// socket io connect import
const socketConnect = require("./utils/func/socketio");
socketConnect();

dotenv.config(); // called dotenv

// Setup view/template engine
app.set("view engine", "ejs");
app.set("views", "views");

// middleware imports
const { cookieParse } = require("./middleware/parser");

// Middleware Array
const middleware = [morgan("dev"), express.static("public"), express.urlencoded({ extended: true }), express.json(), cookieParse];
console.clear();
app.use(middleware);

app.use("/", routes);

/* Configuration */
const { PORT, NODE_ENV, DB_URI } = process.env;

mongoose
	.connect(DB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
	.then(() => {
		console.log(`Database connected ${NODE_ENV || "development"}`);
		server.listen(PORT, () => {
			console.log(`Server is Running on ${PORT}`);
		});
	})
	.catch((e) => {
		return console.log(e);
	});
