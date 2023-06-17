const express = require("express");
const router = express.Router();
// auth route
const authRouter = require('../routers/auth.router')
router.use('/auth', authRouter);
// api route
const apiRouter = require('./api.router');
router.use('/api', apiRouter);

// status route
router.get('/status', (req, res)=>{
    return res.status(200).json({status : 'OK', code : 200, last_modified : _STATUS_TIME});
})

// route notfound
router.all('*',(req,res)=>{
    return res.sendStatus("404");
})
module.exports = router;