const { contractAbi, contractAddress, version } = require("../configs/constance");
const hre = require("ethers");

const getContractInfo = (req, res)=>{
    const { version : ver } = req.params;
    if (!ver || ver != version) return res.status(403).json({
        code : 403,
        message : "Forbidden!"
    })
    return res.status(200).json({
        code : 200,
        message : "Get success info",
        abi : contractAbi,
        address : contractAddress
    });
}
module.exports = {
    getContractInfo
}