const jwtHelper = require('../helpers/jwt.helper');
const _ = require('underscore');
const {logEvents} = require("./logEvents");
const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET

const verifyToken = async (req, res, next)=>{
    if (!req.headers.authorization && !req.cookies.session_token){
        // no token provided
        return res.status(401).json({
            code : 401,
            message : 'Unauthorized!'
        });
    }
    try {
        const session_token = req.cookies.session_token || req.headers.authorization.split(' ')[1];
        const { decoded } = await jwtHelper.verifyToken(session_token, JWT_TOKEN_SECRET);
        next()
    } catch (error) {
        process.env.NODE_ENV != 'development'
        ? logEvents(`${error.name}: ${error.message}`,`errors`)
        :   console.log(`${error.name}: ${error.message}`);
        return res.status(401).json({
            code : 401,
            message : 'Unauthorized!'
        });
    }
}

module.exports = {
    verifyToken
}