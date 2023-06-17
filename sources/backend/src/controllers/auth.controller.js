const jwtHelper = require('../helpers/jwt.helper');
const _ = require('underscore');
const { UserModel } = require('../models/users.model');
const { v4 : uuidv4 } = require('uuid')
const { logEvents } = require("../middlewares/logEvents");
const ethers = require("ethers")
const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET
const JWT_TOKEN_LIFE = process.env.JWT_TOKEN_LIFE

const signIn = async (req,res)=>{
    const { publicAddress, signature } = req.body;
    // Form invalid
    if (!publicAddress || !signature) return res.status(400).json({
        code : 400,
        message : "Form request invalid!"
    })
    try {
        const user = await UserModel.findOne({ publicAddress : publicAddress});
        if (!user){
            return res.status(403).json({
                code : 404,
                message : "Please register one account!"
            })
        }
        // get nonce
        const nonce = user.nonce;
        // compare
        const retrivePublicAddress = ethers.utils.verifyMessage(`Nonce : ${nonce}`, signature);
        if (publicAddress.toLowerCase() !== retrivePublicAddress.toLowerCase()){
            return res.status(401).json({
                code : 401,
                message : "Signature invalid! Please login again."
            })
        }
        // Set new nonce
        user.nonce = Math.floor(Math.random()*10000000);
        await user.save();
        // set cookie
        const { encoded : session } = await jwtHelper.generateToken({
            publicAddress
        }, JWT_TOKEN_SECRET, JWT_TOKEN_LIFE)
        res.cookie("session_token", session, {
            sameSite: 'none',
            httpOnly : true,
            secure : true,
            path : '/'
        })
        // res back
        return res.status(200).json({
            code : 200,
            message : "Login success!"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            code : 500,
            message : "Server error!"
        })
    }
}

const signUp = async (req, res)=>{
    const { publicAddress } = req.body;
    // 
    if (!publicAddress) return res.status(400).json({
        code : 400,
        message : "Form request invalid!"
    })
    // check valid address
    const valid = ethers.utils.isAddress(publicAddress);
    if (!valid) return res.status(400).json({
        code : 400,
        message : "Invalid address! Please enter with the valid public address."
    })
    try {
        const user = await UserModel.findOne({ publicAddress : publicAddress});
        if (!user){
            // create new
            const newUser = new UserModel();
            newUser.publicAddress = publicAddress;
            const nonce = Math.floor(Math.random()*10000000);
            newUser.nonce = nonce;
            await newUser.save();
            return res.status(200).json({
                code : 200,
                message : "Successful!",
                nonce : nonce
            })
        }
        return res.status(200).json({
            code : 200,
            message : "Successful!",
            nonce : user.nonce
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            code : 500,
            message : "Server error!"
        })
    }
}
module.exports = {
    signIn,
    signUp
}