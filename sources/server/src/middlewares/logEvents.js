const { format } = require("date-fns")
const { v4: uuid } = require("uuid")

const fs = require("fs")
const fsPromise = require("fs").promises;
const path = require('path');
const { vi } = require("date-fns/locale");

const logEvents = async (message, typeLog) =>{
    const currentDate = `${format(new Date(), 'dd-MM-yyyy')}`
    const dateTime = `${currentDate}${format(new Date(), '\tHH:mm:ss O',{locale: vi})}`;
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;
    try {
        if (!fs.existsSync(path.join(__dirname, '../..', 'logs', typeLog))){
            if (!fs.existsSync(path.join(__dirname, '../..', 'logs'))){
                await fsPromise.mkdir(path.join(__dirname, '../..', 'logs'));
            }
            await fsPromise.mkdir(path.join(__dirname, '../..', 'logs', typeLog));
        }
        return await fsPromise.appendFile(path.join(__dirname, '../..', 'logs', typeLog, currentDate+".txt"), logItem);
    } catch (error) {
        console.log(error)
    }
}

const reqHandle = (req, res, next) => {
    process.env.NODE_ENV != 'development' 
    ?   logEvents(`${req.method}\t${req.headers.origin || 'localhost'}\t${req.url}`, `requests`)
    :   console.log(`${req.headers.origin || 'localhost'} ${req.method} ${req.path}`);
    next();
}
const errorHandle = (error, req, res, next) => {
    process.env.NODE_ENV != 'development' 
    ?   logEvents(`${req.method}\t${req.headers.origin || 'localhost'}\t${req.url}\t${error.name}: ${error.message}`, `errors`) 
    :   console.log(`${req.headers.origin || 'localhost'} ${req.method} ${req.path}\t${error.name}: ${error.message}`);
    res.status(500).json(`${error.name}: ${error.message}`)
}
module.exports = { reqHandle, errorHandle, logEvents};