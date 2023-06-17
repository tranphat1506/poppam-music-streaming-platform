const { verifyToken } = require('../helpers/jwt.helper')
const userService = require('../services/user.service')

const getInfo = async (req, res)=>{
    // dont support ENS name yet
    const { publicAddress } = req.params;
    try {
        const info = await userService.getUserByAddress(publicAddress, publicAddress);
        return res.status(200).json({ info });
    } catch (error) {
        console.log(error);
        return res.sendStatus(400)
    }
    // .catch((error)=>{
    //     process.env.NODE_ENV != 'development'
    //     ? logEvents(`${error.name}: ${error.message}`,`errors`)
    //     :   console.log(`${error.name}: ${error.message}`);
    //     return res.status(403).json({
    //         message : error.message
    //     });
    // })
}
const getLibrary = async (req, res)=>{
    // dont support ENS name yet
    const { publicAddress } = req.params;
    try {
        const info = await userService.getUserByAddress(publicAddress, publicAddress);
        return res.status(200).json({ info });
    } catch (error) {
        console.log(error);
        return res.sendStatus(400)
    }
}

module.exports = {
    getInfo,
    getLibrary
}