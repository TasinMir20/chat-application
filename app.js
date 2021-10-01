/*****###### Dependencies Start ######*****/

/* Dependencies Modules*/
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const morgan = require('morgan');

const http = require('http');

// routes imports
const routes = require('./routes/routes');

/*****###### Dependencies End ######*****/

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
global.io = io;

// socket io connect import
const socketConnect = require('./utils/func/socketio');
socketConnect();


dotenv.config(); // called dotenv



// Setup view/template engine
app.set("view engine", "ejs");
app.set("views", "views");


// middleware imports
const { cookieParse } = require('./middleware/cookieParse');

// Middleware Array
const middleware = [
    morgan("dev"),
    express.static("public"),
    express.urlencoded({extended: true}),
    express.json(),
    cookieParse
    
];
console.clear()
app.use(middleware);

app.use("/", routes);




/* Configuration */
const config = {
    PORT: process.env.PORT || 2000,
    DB_USERNAME: process.env.DB_USERNAME,
    DB_USER_PASSWORD: process.env.DB_USER_PASSWORD,
    DATABASE_NAME: process.env.DATABASE_NAME
}

// const URL = `mongodb+srv://${config.DB_USERNAME}:${config.DB_USER_PASSWORD}@cluster0.h7kk2.mongodb.net/${config.DATABASE_NAME}`;
const URL = "mongodb://127.0.0.1:27017/login-register-new";

mongoose.connect(URL, {useUnifiedTopology: true, useNewUrlParser: true})
.then(() => {
    console.log("Database connected");

    server.listen(config.PORT, () => {
        console.log(`Server is Running on ${config.PORT}`);
    });
})
.catch(e => {
    return console.log(e);
});
