const express = require('express');
require('dotenv').config()
const PORT = process.env.PORT || 3000;
const HOST = process.env.URL || 'http://locahost';
const bodyParser = require('body-parser')
const app = express();
const http = require("http")
const server = http.createServer(app)
const { reqHandle, errorHandle, logEvents } = require("./src/middlewares/logEvents")
const STATUS_TIME = new Date(Date.now() + 7*60*60*1000).toUTCString()
global._STATUS_TIME = STATUS_TIME;
//INIT NODEJS
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(reqHandle);
app.use(errorHandle);
// port
server.listen(PORT, ()=>{
    process.env.NODE_ENV !== 'development'
    ?   logEvents(`Server run on PORT ${PORT}`,`server`)
    : false;
    console.log(`Server run on PORT ${PORT}`)
})

const Router = require('./src/routers/routers')
app.use(Router)
