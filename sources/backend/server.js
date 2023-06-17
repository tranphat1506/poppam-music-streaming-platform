require('dotenv').config()
const PORT = process.env.PORT || 3000;
const HOST = process.env.URL || 'http://locahost';
const STATUS_TIME = new Date(Date.now() + 7*60*60*1000).toUTCString()
global._STATUS_TIME = STATUS_TIME;
const express = require('express');
const app = express();
const http = require("http")
const server = http.createServer(app)

//MIDDLEWARES
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const cookieParser = require('cookie-parser');
app.use(cookieParser('abc'));
if (process.env.NODE_ENV !== 'development') app.set('trust proxy', 1)
// Security
const helmet = require('helmet');
app.use(helmet());

// CORS
const cors = require('cors');
const { normalCorsOptions } = require('./src/configs/cors.config');
app.use(cors(normalCorsOptions));

// Default headers
/* app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return next();
}); */

// LOGGER
const { reqHandle, errorHandle , logEvents} = require("./src/middlewares/logEvents");

app.use(reqHandle);
app.use(errorHandle);

// Routes
const Router = require('./src/routers/routers')
app.use(Router)

// Run
server.listen(PORT, ()=>{
    process.env.NODE_ENV != 'development'
    ? logEvents(`Server run on PORT ${PORT}`,`server`)
    : false;
    console.log(`Server run on PORT ${PORT}`)
})
// DB
const connectDB = require('./src/configs/database.config')
connectDB
.catch(err=>{
    process.env.NODE_ENV != 'development'
    ? logEvents(`${err.name}: ${err.message}`,`errors`)
    : false;
    console.log(`${err.name}: ${err.message}`)
    server.close();
})
.then(()=>{
    process.env.NODE_ENV != 'development'
    ? logEvents(`Connect DB SUCCESS!`,`server`)
    :   false;
    console.log(`Connect DB SUCCESS!`)
})