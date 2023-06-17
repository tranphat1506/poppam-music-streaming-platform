const express = require('express')
const router = express.Router();
const songRouter = require('../routers/song.router');
const userRouter = require('../routers/user.router');
const contractRouter = require('../routers/contract.router');
const { verifyToken } = require("../middlewares/auth.middleware")
router.use('/contract', verifyToken, contractRouter);
router.use('/song', verifyToken, songRouter)
router.use('/user', userRouter);
router.get("/",  verifyToken,(req, res)=>{
    return res.sendStatus(200);
})
module.exports = router;