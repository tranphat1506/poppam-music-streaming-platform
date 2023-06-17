const role = {
    admin : 'Admin',
    client : 'Client'
}
const jwtHelper = require('../helpers/jwt.helper')
const { UserModel } = require('../models/users.model')
const adminRole = async (req, res, next)=>{
    /* if (!req.headers.authorization && !req.cookies.a_token){
        // no token provided
        return res.status(401).json({
            message : 'Unauthorized!'
        });
    } */
    try {
        const a_token = req.cookies.a_token || req.headers.authorization.split(' ')[1];
        const payload = jwtHelper.getPayload(a_token);
        const UserData = await UserModel.findOne({id : payload.id})
        if(UserData.account_details.role.info !== 'admin'){
            return res.status(403).json({
                code : 403,
                message : 'No permission!'
            });
        }
        next();
    } catch (error) {
        console.log(`${error.name}: ${error.message}`);
        return res.status(500).json({
            code : 500,
            message : 'Hệ thống đang bận!'
        });
    }
}

module.exports = {
    adminRole
}